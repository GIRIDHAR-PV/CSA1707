
room = {
    'A': 'Dirty',
    'B': 'Dirty'
}

location = 'A'

while True:
    print("Current Location:", location)

    if room[location] == 'Dirty':
        print("Room is Dirty. Cleaning...")
        room[location] = 'Clean'
    else:
        print("Room is already Clean.")

    if location == 'A':
        location = 'B'
    else:
        break

print("\nFinal Room Status:")
print(room)
print("Cleaning Completed!")
