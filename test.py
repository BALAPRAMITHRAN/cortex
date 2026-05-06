import requests

url = "http://localhost:8000/query"

while True:
    question = input("\nAsk something (or type 'exit'): ")
    if question == "exit":
        break

    response = requests.post(url, json={"question": question})
    data = response.json()

    print("\nAnswer:", data["answer"])
    print("Sources:", data["sources"])