from django.urls import path
from .views import (
    SubmitTestAPIView,
    CheckTestAccessAPIView,
    CertificateVerifyAPIView,
    LeaderboardAPIView,
    ExportResultsExcelAPIView,
    start_test_session,
    get_test_session,
    save_test_session_answer,
    submit_test_session,
)

urlpatterns = [
    path("submit-test/", SubmitTestAPIView.as_view(), name="submit-test"),
    path("check-test-access/", CheckTestAccessAPIView.as_view(), name="check-test-access"),
    path("leaderboard/", LeaderboardAPIView.as_view(), name="leaderboard"),
    path("export-results-excel/", ExportResultsExcelAPIView.as_view(), name="export-results-excel"),
    path("certificates/<str:code>/", CertificateVerifyAPIView.as_view(), name="certificate-verify"),

    path("start-test-session/", start_test_session, name="start-test-session"),
    path("test-session/<int:session_id>/", get_test_session, name="get-test-session"),
    path("test-session/<int:session_id>/answer/", save_test_session_answer, name="save-test-session-answer"),
    path("test-session/<int:session_id>/submit/", submit_test_session, name="submit-test-session"),
]
