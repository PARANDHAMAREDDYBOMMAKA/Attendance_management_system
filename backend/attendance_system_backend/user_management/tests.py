from django.test import TestCase
from .models import User

class UserTestCase(TestCase):
    def setUp(self):
        User.objects.create(username="testuser", password="password123")

    def test_user_creation(self):
        user = User.objects.get(username="testuser")
        self.assertEqual(user.username, "testuser")
