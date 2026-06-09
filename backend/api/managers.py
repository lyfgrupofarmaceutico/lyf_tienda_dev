from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def email_validator(self, email):
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError(_("Por favor ingrese un correo valido"))

    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValidationError(_("El correo es requerido"))
        email = self.normalize_email(email)
        self.email_validator(email)

        if not first_name:
            raise ValidationError(_("El nombre es requerido"))
        if not last_name:
            raise ValidationError(_("El apellido es requerido"))

        user = self.model(
            email=email, first_name=first_name, last_name=last_name, **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self, email, first_name, last_name, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValidationError(_("Campo requerido para ser superusuario"))
        if extra_fields.get("is_superuser") is not True:
            raise ValidationError(_("Campo requerido para ser superusuario"))
        if extra_fields.get("is_admin") is not True:
            raise ValidationError(_("Campo requerido para ser superusuario"))

        return self.create_user(email, first_name, last_name, password, **extra_fields)
