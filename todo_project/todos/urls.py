from django.urls import path
from .views import TodoListView, TodoItemView, ReassignTaskView

urlpatterns = [
    path('todolists/', TodoListView.as_view(), name='todo-list'),
    path('todolists/<uuid:pk>/', TodoListView.as_view(), name='todo-list-detail'),
    path('todoitems/', TodoItemView.as_view(), name='todo-item'),
    path('todoitems/<uuid:pk>/', TodoItemView.as_view(), name='todo-item-detail'),
    path('todoitems/reassign/', ReassignTaskView.as_view(), name='todo-item-reassign'),
]
