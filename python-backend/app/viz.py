"""Plotly figure builders for the 3D twin, cascade graph, MPI breakdown, ROI curve, topology."""
from __future__ import annotations
import math
from typing import Any, Dict, List

import networkx as nx
import plotly.graph_objects as go


def topology_figure(nodes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Horizontal pipeline diagram of the 5-agent (+feedback) LangGraph topology."""
    xs = list(range(len(nodes)))
    ys = [0] * len(nodes)
    colors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#64748B"]
    fig = go.Figure()
    for i in range(len(nodes) - 1):
        fig.add_annotation(x=xs[i + 1], y=0, ax=xs[i], ay=0, xref="x", yref="y",
                           axref="x", ayref="y", showarrow=True, arrowhead=3,
                           arrowwidth=2, arrowcolor="#94A3B8")
    fig.add_trace(go.Scatter(
        x=xs, y=ys, mode="markers+text",
        marker=dict(size=60, color=colors[:len(nodes)], line=dict(color="#0F172A", width=2)),
        text=[n["label"] for n in nodes], textposition="bottom center",
        textfont=dict(size=11, color="#0F172A"),
        hovertext=[f"{n['label']}<br>{n['role']}" for n in nodes],
        hoverinfo="text",
    ))
    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.5, len(nodes) - 0.5]),
        yaxis=dict(visible=False, range=[-1, 1]),
        height=200, margin=dict(l=10, r=10, t=10, b=60),
        paper_bgcolor="white", plot_bgcolor="white", showlegend=False,
    )
    return fig.to_dict()


def twin_3d(asset_state: Dict[str, float] | None = None) -> Dict[str, Any]:
    """3D digital twin of the plant: COOLING -> MOTOR -> GEARBOX -> COILER."""
    asset_state = asset_state or {}
    nodes = [
        ("COOLING", 0, 0, 1.5), ("MOTOR", 1, 0, 1.0),
        ("GEARBOX", 2, 0, 1.0), ("COILER", 3, 0, 0.7),
    ]
    edges = [(0, 1), (1, 2), (2, 3)]

    def severity_color(name: str) -> str:
        s = float(asset_state.get(name.lower(), 0.2))
        if s > 0.75: return "#EF4444"
        if s > 0.50: return "#F59E0B"
        if s > 0.30: return "#FACC15"
        return "#10B981"

    fig = go.Figure()
    # cylinders (approx using markers)
    for name, x, y, h in nodes:
        fig.add_trace(go.Scatter3d(
            x=[x], y=[y], z=[h / 2], mode="markers+text",
            marker=dict(size=22, color=severity_color(name),
                        line=dict(color="#0F172A", width=2)),
            text=[name], textposition="top center",
            textfont=dict(size=11, color="#0F172A"),
            showlegend=False, hoverinfo="text",
            hovertext=f"{name} severity={asset_state.get(name.lower(),0):.2f}",
        ))
    for a, b in edges:
        n1, n2 = nodes[a], nodes[b]
        fig.add_trace(go.Scatter3d(
            x=[n1[1], n2[1]], y=[n1[2], n2[2]],
            z=[n1[3] / 2, n2[3] / 2],
            mode="lines", line=dict(color="#94A3B8", width=6),
            showlegend=False, hoverinfo="skip",
        ))
    # ground plane
    fig.add_trace(go.Mesh3d(
        x=[-0.5, 3.5, 3.5, -0.5], y=[-1, -1, 1, 1], z=[0, 0, 0, 0],
        i=[0], j=[1], k=[2], color="#E2E8F0", opacity=0.4, showlegend=False,
        hoverinfo="skip",
    ))
    fig.add_trace(go.Mesh3d(
        x=[-0.5, 3.5, 3.5, -0.5], y=[-1, -1, 1, 1], z=[0, 0, 0, 0],
        i=[0], j=[2], k=[3], color="#E2E8F0", opacity=0.4, showlegend=False,
        hoverinfo="skip",
    ))
    fig.update_layout(
        scene=dict(
            xaxis=dict(visible=False), yaxis=dict(visible=False),
            zaxis=dict(visible=False),
            camera=dict(eye=dict(x=1.6, y=1.6, z=0.9)),
        ),
        margin=dict(l=0, r=0, t=0, b=0), height=380,
        paper_bgcolor="white",
    )
    return fig.to_dict()


def cascade_graph(origin: str = "COOLING", severity: float = 0.8) -> Dict[str, Any]:
    """Failure Propagation Network across the asset dependency graph."""
    G = nx.DiGraph()
    edges = [
        ("COOLING", "MOTOR", 1.5),
        ("COOLING", "GEARBOX", 6.0),
        ("MOTOR", "GEARBOX", 4.5),
        ("GEARBOX", "COILER", 5.0),
    ]
    for u, v, t in edges:
        G.add_edge(u, v, eta=t)
    pos = {"COOLING": (0, 1), "MOTOR": (1, 1.5), "GEARBOX": (2, 0.5), "COILER": (3, 1)}

    # propagated severity by simple BFS
    sev = {n: 0.0 for n in G.nodes()}
    sev[origin] = severity
    for u, v, _ in edges:
        decay = 0.80 if (u, v) != ("COOLING", "GEARBOX") else 0.7
        sev[v] = max(sev[v], sev[u] * decay)

    edge_x, edge_y = [], []
    for u, v in G.edges():
        x0, y0 = pos[u]; x1, y1 = pos[v]
        edge_x += [x0, x1, None]; edge_y += [y0, y1, None]

    fig = go.Figure()
    fig.add_trace(go.Scatter(x=edge_x, y=edge_y, mode="lines",
                             line=dict(color="#94A3B8", width=3), hoverinfo="none",
                             showlegend=False))
    for n, (x, y) in pos.items():
        s = sev[n]
        c = "#EF4444" if s > 0.6 else "#F59E0B" if s > 0.35 else "#10B981"
        fig.add_trace(go.Scatter(
            x=[x], y=[y], mode="markers+text",
            marker=dict(size=46, color=c, line=dict(color="#0F172A", width=2)),
            text=[f"<b>{n}</b><br>{s:.2f}"], textposition="middle center",
            textfont=dict(size=10, color="white"),
            hovertext=f"{n} severity={s:.2f}", hoverinfo="text", showlegend=False,
        ))
    for u, v, t in edges:
        mx = (pos[u][0] + pos[v][0]) / 2; my = (pos[u][1] + pos[v][1]) / 2
        fig.add_annotation(x=mx, y=my, text=f"+{t} min", showarrow=False,
                           font=dict(size=9, color="#64748B"),
                           bgcolor="white", borderpad=2)
    fig.update_layout(
        xaxis=dict(visible=False, range=[-0.5, 3.5]),
        yaxis=dict(visible=False, range=[0, 2]),
        height=320, margin=dict(l=10, r=10, t=10, b=10),
        paper_bgcolor="white", plot_bgcolor="white",
    )
    return fig.to_dict()


def mpi_breakdown(mpi_components: Dict[str, float], mpi_total: float) -> Dict[str, Any]:
    labels = list(mpi_components.keys())
    vals = [mpi_components[k] for k in labels]
    fig = go.Figure(go.Bar(
        x=labels, y=vals,
        marker_color=["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"][:len(labels)],
        text=[f"{v:.0f}" for v in vals], textposition="outside",
    ))
    fig.update_layout(
        title=dict(text=f"MPI = {mpi_total:.1f}", x=0.5, font=dict(size=14)),
        yaxis=dict(range=[0, 110], title="component score (0-100)"),
        height=260, margin=dict(l=40, r=10, t=40, b=40),
        paper_bgcolor="white", plot_bgcolor="white",
    )
    return fig.to_dict()


def roi_curve(downtime_cost_inr_hr: float, lead_days_max: int = 14) -> Dict[str, Any]:
    xs = list(range(0, lead_days_max + 1))
    # Avoidable cost = base cost * (1 + lead_days/7)
    base = downtime_cost_inr_hr * 4  # 4-hour MTTI baseline
    ys = [base * (1 + d / 7.0) for d in xs]
    fig = go.Figure(go.Scatter(
        x=xs, y=ys, mode="lines+markers",
        line=dict(color="#3B82F6", width=3),
        marker=dict(size=8, color="#3B82F6"),
        fill="tozeroy", fillcolor="rgba(59,130,246,0.15)",
    ))
    fig.update_layout(
        xaxis=dict(title="spare lead-time (days)"),
        yaxis=dict(title="downtime cost exposure (INR)"),
        height=260, margin=dict(l=60, r=10, t=10, b=40),
        paper_bgcolor="white", plot_bgcolor="white",
        showlegend=False,
    )
    return fig.to_dict()
