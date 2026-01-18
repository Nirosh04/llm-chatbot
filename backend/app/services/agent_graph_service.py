from langgraph.graph import StateGraph, END
from services.states.agent_sampler_state import AgentState
from services.nodes.agent_sampler_nodes import guardrail_node, extraction_node, interviewer_node
from langgraph.checkpoint.memory import MemorySaver

#  Router: decide next node name
def route_after_guardrail(state: AgentState) -> str:
    # If there's new medical info, re-extract; otherwise skip extraction
    return "extractor" if state.get("contains_new_medical_info", False) else "interviewer"


workflow = StateGraph(AgentState)

# Nodes
workflow.add_node("guardrail", guardrail_node)
workflow.add_node("extractor", extraction_node)
workflow.add_node("interviewer", interviewer_node)

# CODE EXPLANATION: in case no new medical info was added --> skip redoing the sampler. But for now postponed
# Conditional edge from guardrail -> (extractor OR interviewer) 
#workflow.add_conditional_edges(
#    "guardrail",
#    route_after_guardrail,
#    {
#        "extractor": "extractor",
#        "interviewer": "interviewer",
#    },
#)


# Entry Point
workflow.set_entry_point("guardrail")

# Logic Flow
workflow.add_edge("guardrail", "extractor")
workflow.add_edge("extractor", "interviewer")
#workflow.add_edge("interviewer", END)


# Conditional End
# def should_continue(state: AgentState):
#     if state["is_complete"]:
#         return END
#     return END 

# workflow.add_conditional_edges("interviewer", should_continue)

# Compile
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)