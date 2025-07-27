from rest_framework import generics, mixins
from rest_framework.permissions import IsAuthenticated
from users.authentication import FirebaseOptionalAuthentication
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from .models import TodoList, TodoItem
from .serializers import TodoListSerializer, TodoItemSerializer
from .permissions import is_admin
from users.models import User
from rest_framework.views import APIView

from rest_framework.pagination import PageNumberPagination

class TodoItemPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000

class ReassignTaskView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [FirebaseOptionalAuthentication]

    def post(self, request):
        data = request.data.copy()
        task_id = data.get("task_id")
        from_list_id = data.get("from_todolist_id")
        to_owner_email = data.get("to_owner_email")
        to_list_name = data.get("to_todolist_name")

        if not all([task_id, from_list_id, to_owner_email, to_list_name]):
            return Response({"error": "All fields are required."}, status=400)

        try:
            task = TodoItem.objects.get(id=task_id)
        except TodoItem.DoesNotExist:
            return Response({"error": "Task not found."}, status=404)

        try:
            from_list = TodoList.objects.get(id=from_list_id)
        except TodoList.DoesNotExist:
            return Response({"error": "From TodoList not found."}, status=404)

        try:
            to_owner = User.objects.get(email=to_owner_email)
        except User.DoesNotExist:
            return Response({"error": "Target user not found."}, status=404)


        normalized_name = to_list_name.strip()
        try:
            to_list = TodoList.objects.get(owner=to_owner, name=normalized_name)
        except TodoList.DoesNotExist:
            return Response(
                {"error": "The target TodoList does not exist for this user."},
                status=404
            )
        task.todo_list = to_list
        task.save(update_fields=["todo_list", "last_modified"])
        task.refresh_from_db()

        print(f"Task '{task.title}' reassigned to list ID {task.todo_list_id} owned by {to_owner.email}")

        return Response({
            "message": "Task reassigned successfully.",
            "task": TodoItemSerializer(task).data,
            "new_list_id": str(to_list.id),
            "new_list_name": to_list.name,
            "new_owner_email": to_owner.email,
        }, status=200)


class TodoListView(mixins.ListModelMixin,
                   mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.DestroyModelMixin,
                   mixins.UpdateModelMixin,
                   generics.GenericAPIView):
    queryset = TodoList.objects.all()
    serializer_class = TodoListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TodoList.objects.all()

        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(owner__id=user_id)

        todo_list_id = self.request.query_params.get("todo_list")
        if todo_list_id:
            queryset = queryset.filter(id=todo_list_id)

        return queryset



    def perform_create(self, serializer):
        user = self.request.user
        requested_owner = self.request.data.get("owner")

        if is_admin(user) and requested_owner:
            try:
                owner = User.objects.get(id=requested_owner)
                serializer.save(owner=owner)
            except User.DoesNotExist:
                raise PermissionDenied("Invalid owner ID provided.")

        elif not is_admin(user) and requested_owner and str(requested_owner) != str(user.id):
            raise PermissionDenied("You can only create TodoLists for yourself.")

        else:
            serializer.save(owner=user)


    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs) if 'pk' in kwargs else self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        data = request.data.copy()

        if not is_admin(user) and instance.owner != user:
            raise PermissionDenied("You can only update your own TodoLists.")

        if is_admin(user) and 'owner' in data:
            try:
                new_owner = User.objects.get(id=data['owner'])
                data['owner'] = str(new_owner.id)
            except User.DoesNotExist:
                raise PermissionDenied("Invalid owner ID provided.")

        elif not is_admin(user) and 'owner' in data:
            del data['owner']

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class TodoItemView(mixins.ListModelMixin,
                   mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   mixins.DestroyModelMixin,
                   generics.GenericAPIView):
    queryset = TodoItem.objects.all()
    serializer_class = TodoItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TodoItemPagination

    def get_queryset(self):
        user = self.request.user
        base_qs = TodoItem.objects.all() if is_admin(user) else TodoItem.objects.filter(todo_list__owner=user)
        return base_qs.order_by("created_at")

    def perform_create(self, serializer):
        todo_list = serializer.validated_data.get('todo_list')
        user = self.request.user
        if not is_admin(user) and todo_list.owner != user:
            raise PermissionDenied("You can only create items in your own TodoLists.")
        serializer.save()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if not is_admin(user) and obj.todo_list.owner != user:
            raise PermissionDenied("You do not have permission to access this item.")
        return obj

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs) if 'pk' in kwargs else self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


