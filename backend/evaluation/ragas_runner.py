# evaluation/ragas_runner.py
import json
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from langchain_community.chat_models.ollama import ChatOllama

from pipeline.retrieve import retrieve
from pipeline.generate import generate_answer


async def run_ragas(pipeline_state: dict):
    """Run RAGAS evaluation on the test set using local Ollama."""
    with open("storage/test_set.json") as f:
        test_set = json.load(f)

    results = []
    for item in test_set:
        docs = retrieve(item["question"], pipeline_state)
        context = "\n\n".join([d.page_content for d in docs])
        answer = generate_answer(context, item["question"])  # non-streaming version
        results.append({
            "question": item["question"],
            "answer": answer,
            "contexts": [context],
            "ground_truth": item["ground_truth"]
        })

    dataset = Dataset.from_list(results)
    
    # Configure RAGAS to use local Ollama for both LLM and embeddings
    llm = ChatOllama(model="llama3:latest", base_url="http://localhost:11434")
    embeddings = pipeline_state["embeddings"]  # Use the same embeddings from pipeline
    
    # Evaluate with local LLM and embeddings
    scores = evaluate(
        dataset, 
        metrics=[faithfulness, answer_relevancy, context_precision],
        llm=llm,
        embeddings=embeddings
    )
    
    # Clean up NaN/inf values in scores before returning
    scores_dict = scores.to_pandas().to_dict()
    
    # Replace NaN and inf values with None or meaningful defaults
    def clean_value(v):
        if isinstance(v, float):
            if v != v:  # NaN check
                return None
            if v == float('inf') or v == float('-inf'):
                return None
        return v
    
    cleaned_scores = {}
    for key, values in scores_dict.items():
        if isinstance(values, dict):
            # RAGAS may return a nested dict with a single row index.
            # Flatten it so the frontend receives a simple numeric score.
            if len(values) == 1:
                nested_value = next(iter(values.values()))
                cleaned_scores[key] = clean_value(nested_value)
            else:
                # If there are multiple rows, take the mean score as a fallback.
                cleaned_values = [clean_value(v) for v in values.values()]
                numeric_values = [v for v in cleaned_values if v is not None and isinstance(v, (int, float))]
                cleaned_scores[key] = sum(numeric_values) / len(numeric_values) if numeric_values else None
        else:
            cleaned_scores[key] = clean_value(values)
    
    return cleaned_scores