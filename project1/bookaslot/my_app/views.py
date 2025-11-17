from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.

def print_hello(request):
    movie_details={"movies":[{
        "title":"hulk",
        "year":2008,
        "summary":"best hilk in the marvel universe",
        "success":True,
    },{
        "title":"thor",
        "year":2008,
        "summary":"best hilk in the marvel universe",
        "success":True,
    },{
        "title":"spider",
        "year":2008,
        "summary":"",
        "success":True,
    },{
        "title":"iron",
        "year":2008,
        "summary":"best hilk in the marvel universe",
        "success":False,
    },{
        "title":"batman",
        "year":2008,
        "summary":"best hilk in the marvel universe",
        "success":False,
    }]}
    return render(request,'hello.html',movie_details)
