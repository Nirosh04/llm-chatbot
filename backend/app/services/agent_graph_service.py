from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from services.states.agent_sampler_state import AgentState
from services.nodes.agent_sampler_nodes import classifier_node, companion_node, extraction_node, navigation_node, offtopic_node, refiner_node


# def route_after_companion(state: AgentState) -> str:
#     """Decide whether extraction is needed for this user turn."""
#     if state.get("contains_new_medical_info") and not state.get("has_extracted_this_turn"):
#         return "extractor"
#     return END


workflow = StateGraph(AgentState)

# Nodes
workflow.add_node("classifier", classifier_node) 
workflow.add_node("companion", companion_node)
workflow.add_node("extractor", extraction_node)
workflow.add_node("navigation", navigation_node)
workflow.add_node("offtopic", offtopic_node)
workflow.add_node("refiner", refiner_node)


# Entry point
# workflow.set_entry_point("companion")

# # Companion decides whether extraction is needed
# workflow.add_conditional_edges(
#     "companion",
#     route_after_companion,
#     {
#         "extractor": "extractor",
#         END: END,
#     },
# )

# IMPORTANT: extractor ends the turn (prevents companion->extractor->companion loops)
workflow.add_edge(START, "classifier")

workflow.add_conditional_edges(
    "classifier",
    lambda state: state.get("message_type"),
    {"medical": "extractor", "navigation": "navigation", "offtopic": "offtopic"}
)
workflow.add_edge("extractor", "refiner")
workflow.add_edge("refiner", "companion")
workflow.add_edge("companion", END)
workflow.add_edge("navigation", END)
workflow.add_edge("offtopic", END)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
