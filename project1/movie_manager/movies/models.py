from django.db import models

# Create your models here.
class CensorInfo(models.Model):
    rating=models.CharField(max_length=10,null=True)
    certified_by=models.CharField(max_length=10,null=True)

class Director(models.Model):
    name=models.CharField(max_length=25)

class MovieInfo(models.Model):
    title=models.CharField(max_length=200)
    year=models.IntegerField(null=True) 
    summary=models.TextField()
    poster = models.ImageField(upload_to='posters/', null=True, blank=True)
    censor_details=models.OneToOneField(CensorInfo,on_delete=models.SET_NULL,related_name='movie',null=True)
    directed_by=models.ForeignKey(Director,on_delete=models.CASCADE,related_name='director',null=True)
    def __str__(self):
        return self.title
