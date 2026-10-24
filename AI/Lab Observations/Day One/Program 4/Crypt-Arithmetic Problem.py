from itertools import permutations

letters = "SENDMORY"

for digits in permutations(range(10), len(letters)):
    values = dict(zip(letters, digits))

    if values["S"] == 0 or values["M"] == 0:
        continue

    send = (values["S"] * 1000 + values["E"] * 100
            + values["N"] * 10 + values["D"])

    more = (values["M"] * 1000 + values["O"] * 100
            + values["R"] * 10 + values["E"])

    money = (values["M"] * 10000 + values["O"] * 1000
             + values["N"] * 100 + values["E"] * 10
             + values["Y"])

    if send + more == money:
        print("SEND =", send)
        print("MORE =", more)
        print("MONEY =", money)
        break
