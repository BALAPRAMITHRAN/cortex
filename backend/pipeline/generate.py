# pipeline/generate.py

from ollama import Client

client = Client(host='http://localhost:11434', timeout=120)

def build_prompt(context: str, question: str) -> str:
    return f"""You are a helpful research assistant. Answer the question using the context below.
Be thorough. Extract all relevant information from the context to form your answer.
If the context partially answers the question, provide what you can find.
Only say you cannot answer if the context is completely unrelated to the question.

Context:
{context}

Question: {question}

Answer:"""


def generate_answer(context: str, question: str) -> str:
    """
    Non-streaming version — returns full answer at once.
    Used by the RAGAS evaluation endpoint.
    """
    try:
        response = client.chat(
            model='llama3.2:1b',
            messages=[{"role": "user", "content": build_prompt(context, question)}]
        )
        return response['message']['content']
    except Exception as e:
        print(f"Ollama error in generate_answer: {e}")
        return "Error: Ollama failed to generate an answer. Please check the LLM server."


async def generate_stream(context: str, question: str):
    """
    Streaming version — yields tokens one by one.
    Used by the /query/stream endpoint.
    """
    try:
        stream = client.chat(
            model='llama3.2:1b',
            messages=[{"role": "user", "content": build_prompt(context, question)}],
            stream=True
        )
        for chunk in stream:
            yield chunk['message']['content']
    except Exception as e:
        print(f"Ollama error in generate_stream: {e}")
        yield "Error: Ollama runner failed. Please restart the Ollama service or use a smaller model."