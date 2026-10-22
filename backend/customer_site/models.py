from django.db import models


class BetaApplication(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    platform = models.CharField(max_length=20)
    experience = models.CharField(max_length=30)
    updates = models.BooleanField(default=False)
    consent_version = models.CharField(max_length=30, default='2026-10-21')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')


class SupportRequest(models.Model):
    email = models.EmailField()
    category = models.CharField(max_length=30)
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)


class RequestLimit(models.Model):
    key = models.CharField(max_length=64, unique=True)
    window = models.BigIntegerField()
    count = models.PositiveIntegerField(default=0)
