from django.shortcuts import render


def landing(request):
    return render(request, 'school/landing.html')


def students(request):
    return render(request, 'school/students.html')


def athletics(request):
    events = [
        {'sport': 'Soccer', 'date': 'April 18, 2026', 'opponent': 'St. Michael\'s Academy', 'location': 'Home Field', 'type': 'Home'},
        {'sport': 'Basketball', 'date': 'April 22, 2026', 'opponent': 'Immaculate Heart Prep', 'location': 'Gymnasium', 'type': 'Home'},
        {'sport': 'Track & Field', 'date': 'April 25, 2026', 'opponent': 'Regional Championship', 'location': 'City Stadium', 'type': 'Away'},
        {'sport': 'Swimming', 'date': 'May 3, 2026', 'opponent': 'Cardinal Newman School', 'location': 'Aquatic Center', 'type': 'Away'},
        {'sport': 'Volleyball', 'date': 'May 8, 2026', 'opponent': 'St. Agnes Academy', 'location': 'Gymnasium', 'type': 'Home'},
        {'sport': 'Cross Country', 'date': 'May 15, 2026', 'opponent': 'Diocesan Championship', 'location': 'Riverside Park', 'type': 'Away'},
    ]
    return render(request, 'school/athletics.html', {'events': events})


def faith(request):
    return render(request, 'school/faith.html')


def pilgrimages(request):
    trips = [
        {
            'destination': 'Rome & Vatican City',
            'icon': '\U0001f3db',
            'description': 'Walk in the footsteps of the Apostles. Visit St. Peter\'s Basilica, the Sistine Chapel, and the Catacombs. Attend a Papal audience.',
            'dates': 'June 15 \u2013 June 25, 2026',
            'duration': '10 days',
        },
        {
            'destination': 'Lourdes, France',
            'icon': '\u271d',
            'description': 'Journey to the site of Our Lady\'s apparitions to St. Bernadette. Participate in the candlelight procession and bathe in the healing waters.',
            'dates': 'July 10 \u2013 July 17, 2026',
            'duration': '7 days',
        },
        {
            'destination': 'The Holy Land',
            'icon': '\u2721',
            'description': 'Walk where Jesus walked. Visit Nazareth, Bethlehem, Jerusalem, the Sea of Galilee, and the Via Dolorosa.',
            'dates': 'March 20 \u2013 March 30, 2027',
            'duration': '10 days',
        },
        {
            'destination': 'Our Lady of Guadalupe, Mexico',
            'icon': '\U0001f339',
            'description': 'Pilgrimage to the Basilica of Our Lady of Guadalupe in Mexico City, the most visited Catholic pilgrimage site in the Americas.',
            'dates': 'December 8 \u2013 December 14, 2026',
            'duration': '6 days',
        },
    ]
    return render(request, 'school/pilgrimages.html', {'trips': trips})


def prospective(request):
    return render(request, 'school/prospective.html')


def shop(request):
    items = [
        {'name': 'Fidelis Academy T-Shirt', 'icon': '\U0001f455', 'price': '$22', 'desc': 'Classic navy cotton tee with gold crest'},
        {'name': 'Fidelis Hoodie', 'icon': '\U0001f9e5', 'price': '$45', 'desc': 'Premium heavyweight pullover hoodie'},
        {'name': 'Crest Baseball Cap', 'icon': '\U0001f9e2', 'price': '$28', 'desc': 'Structured cap with embroidered school crest'},
        {'name': 'Canvas Tote Bag', 'icon': '\U0001f45c', 'price': '$18', 'desc': 'Natural canvas with navy screen print'},
        {'name': 'Fidelis Polo Shirt', 'icon': '\U0001f454', 'price': '$35', 'desc': 'Performance polo in navy with gold trim'},
        {'name': 'Spirit Sweatpants', 'icon': '\U0001fa73', 'price': '$38', 'desc': 'Comfortable fleece joggers with school logo'},
    ]
    return render(request, 'school/shop.html', {'items': items})
