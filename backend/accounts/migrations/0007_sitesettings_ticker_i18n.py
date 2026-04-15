from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_sitesettings_mvp_business_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="ticker_text_uz",
            field=models.TextField(
                blank=True,
                default="Ushbu platforma yordamida o'z bilimingizni sinab ko'rishingiz mumkin va o'z reyting natijalaringiz bilan tanishib olasiz",
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="ticker_text_ru",
            field=models.TextField(
                blank=True,
                default="С помощью этой платформы вы можете проверить свои знания и ознакомиться со своими результатами в рейтинге",
            ),
        ),
    ]
