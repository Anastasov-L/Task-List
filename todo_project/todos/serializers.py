from rest_flex_fields import FlexFieldsModelSerializer
from .models import TodoList, TodoItem
from users.models import User
from rest_framework import serializers

class UserSerializer(FlexFieldsModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class TodoItemSerializer(FlexFieldsModelSerializer):
    expandable_fields = {
        'assignee': (UserSerializer, {'source': 'assignee'})
    }

    class Meta:
        model = TodoItem
        fields = ['id', 'title', 'description', 'status', 'assignee', 'todo_list', 'created_at', 'last_modified']


class TodoListSerializer(FlexFieldsModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    items = TodoItemSerializer(many=True, read_only=True)
    expandable_fields = {
        'owner': (UserSerializer, {'source': 'owner'}),
        'items': (TodoItemSerializer, {'many': True, 'source': 'items'}),
    }

    class Meta:
        model = TodoList
        fields = '__all__'
