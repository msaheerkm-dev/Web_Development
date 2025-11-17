from django.shortcuts import redirect, render
from django.http import HttpResponse
from  . models import MovieInfo
from  . forms import MovieForm

# Create your views here.
def create(request):
    if request.POST:
        frm = MovieForm(request.POST,request.FILES)  
        print("hello ",request.FILES)
        if frm.is_valid():
            frm.save()
            return redirect('list')
    else:
        frm=MovieForm()
    return render(request,'create.html',{'frm':frm})

def edit(request,pk):
    instance=MovieInfo.objects.get(pk=pk)
    if request.POST:
        frm = MovieForm(request.POST,instance=instance)
        if frm.is_valid():
            instance.save()
    else:
        frm=MovieForm(instance=instance)
    return render(request,'create.html',{'frm':frm})

def list(request):
    movie_set=MovieInfo.objects.all()
    print(movie_set)
    return render(request,'list.html',{'movies':movie_set})

def menu(request):
    return render(request,'menu.html')

def delete(request,pk):
    instance=MovieInfo.objects.get(pk=pk)
    instance.delete()
    movie_set=MovieInfo.objects.all()
    return render(request,'list.html',{'movies':movie_set})