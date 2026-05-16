from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0008_alter_payment_options_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='payment',
            name='unique_user_coach_payment',
        ),
    ]
