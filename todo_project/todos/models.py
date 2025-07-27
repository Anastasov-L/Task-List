import uuid
from django.db import models
from users.models import User

class TodoList(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todo_lists')
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100)

    def __str__(self):
            return self.name

class TodoItem(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_items')
    todo_list = models.ForeignKey(TodoList, on_delete=models.CASCADE, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
