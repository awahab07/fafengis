# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt


def index(request):
    return render(request, 'map/home.html')

def district_constituencies_map(request):
    return render(request, 'map/district_constituencies_map.html')

def angular_map(request):
    return render(request, 'map/angular_map.html')