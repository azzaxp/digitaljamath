
from rest_framework import serializers

from .models import Survey, SurveyResponse, StaffRole, StaffMember

class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'

class SurveyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyResponse
        fields = '__all__'

# ============================================================================
# RBAC SERIALIZERS
# ============================================================================

class StaffRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffRole
        fields = '__all__'

class StaffMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)

    class Meta:
        model = StaffMember
        fields = ['id', 'user', 'user_email', 'role', 'role_name', 'designation', 'is_active', 'joined_at']
