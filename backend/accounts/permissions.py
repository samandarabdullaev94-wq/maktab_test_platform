from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class CanManageUsers(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_users
            )
        )


class CanManageSettings(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_settings
            )
        )


class CanManageOrganizations(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_organizations
            )
        )


class CanManageClasses(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_classes
            )
        )


class CanManageTests(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_tests
            )
        )


class CanManageContent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_content
            )
        )


class CanViewResults(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_view_results
            )
        )


class CanExportExcel(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_export_excel
            )
        )


class CanReadClassesForTests(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.role == "admin"
                or request.user.can_manage_classes
                or (
                    request.method in SAFE_METHODS
                    and request.user.can_manage_tests
                )
            )
        )
