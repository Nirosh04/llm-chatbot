from langgraph.graph import StateGraph, END
from backend.app.services.states.agent_sampler_state import AgentState
from backend.app.services.nodes.agent_sampler_nodes import guardrail_node, extraction_node, interviewer_node

workflow = StateGraph(AgentState)

# Nodes
workflow.add_node("guardrail", guardrail_node)
workflow.add_node("extractor", extraction_node)
workflow.add_node("interviewer", interviewer_node)

# Entry Point
workflow.set_entry_point("guardrail")

# Logic Flow
workflow.add_edge("guardrail", "extractor")
workflow.add_edge("extractor", "interviewer")

# Conditional End
def should_continue(state: AgentState):
    if state["is_complete"]:
        return END
    return END 

workflow.add_conditional_edges("interviewer", should_continue)

# Compile
app = workflow.compile()