from django.urls import path
from .views import (
    TestListAPIView,
    TestQuestionsAPIView,
    AdminDirectionListCreateAPIView,
    admin_direction_update_view,
    AdminSubjectListCreateAPIView,
    admin_subject_update_view,
    AdminTestListCreateAPIView,
    admin_test_update_view,
    AdminQuestionListCreateAPIView,
    admin_question_update_view,
    AdminAnswerListCreateAPIView,
    admin_answer_update_view,
)

urlpatterns = [
    # public
    path("tests/", TestListAPIView.as_view(), name="tests-list"),
    path("tests/<int:test_id>/questions/", TestQuestionsAPIView.as_view(), name="test-questions"),

    # admin
    path("admin/directions/", AdminDirectionListCreateAPIView.as_view(), name="admin-directions"),
    path("admin/directions/<int:direction_id>/", admin_direction_update_view, name="admin-direction-update"),

    path("admin/subjects/", AdminSubjectListCreateAPIView.as_view(), name="admin-subjects"),
    path("admin/subjects/<int:subject_id>/", admin_subject_update_view, name="admin-subject-update"),

    path("admin/tests/", AdminTestListCreateAPIView.as_view(), name="admin-tests"),
    path("admin/tests/<int:test_id>/", admin_test_update_view, name="admin-test-update"),

    path("admin/questions/", AdminQuestionListCreateAPIView.as_view(), name="admin-questions"),
    path("admin/questions/<int:question_id>/", admin_question_update_view, name="admin-question-update"),

    path("admin/answers/", AdminAnswerListCreateAPIView.as_view(), name="admin-answers"),
    path("admin/answers/<int:answer_id>/", admin_answer_update_view, name="admin-answer-update"),
]