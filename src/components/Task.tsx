"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Minus } from "lucide-react";

interface Node {
  id: string;
  label: string;
  children: Node[];
  parentId: string | null;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const NodeComponent = ({
  node,
  onAddPeer,
  onAddChild,
  onRemove,
}: {
  node: Node;
  onAddPeer: (id: string) => void;
  onAddChild: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="border p-2 m-2 rounded bg-white shadow">
      <div className="flex justify-between items-center">
        <span>{node.label}</span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddPeer(node.id)}
          >
            <Plus className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddChild(node.id)}
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRemove(node.id)}
          >
            <Minus className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
      <div className="ml-4 border-l border-gray-300 pl-2">
        {node.children.map((child) => (
          <NodeComponent
            key={child.id}
            node={child}
            onAddPeer={onAddPeer}
            onAddChild={onAddChild}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

const OrgChart = () => {
  const [tree, setTree] = useState<Node[]>([
    {
      id: "director",
      label: "Director",
      parentId: null,
      children: [],
    },
  ]);

  const addChildNode = (parentId: string) => {
    const newNode: Node = {
      id: generateId(),
      label: `Subordinate of ${parentId}`,
      children: [],
      parentId,
    };

    const updateTree = (nodes: Node[]): Node[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, children: [...node.children, newNode] };
        }
        return { ...node, children: updateTree(node.children) };
      });

    setTree(updateTree(tree));
  };

  const addPeerNode = (nodeId: string) => {
    const findParentId = (nodes: Node[], targetId: string): string | null => {
      for (const node of nodes) {
        if (node.children.some((child) => child.id === targetId)) {
          return node.id;
        }
        const found = findParentId(node.children, targetId);
        if (found) return found;
      }
      return null;
    };

    const parentId = findParentId(tree, nodeId);

    const newNode: Node = {
      id: generateId(),
      label: `Branch Member of ${parentId ?? "Top"}`,
      children: [],
      parentId,
    };

    const updateTree = (nodes: Node[]): Node[] =>
      nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, children: [...node.children, newNode] };
        }
        return { ...node, children: updateTree(node.children) };
      });

    if (parentId) setTree(updateTree(tree));
  };

  const removeNode = (id: string) => {
    const deleteNode = (nodes: Node[]): Node[] =>
      nodes
        .filter((node) => node.id !== id)
        .map((node) => ({ ...node, children: deleteNode(node.children) }));
    setTree(deleteNode(tree));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-center mb-4">
        Organizational Structure
      </h2>
      <div className="flex justify-center">
        {tree.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            onAddPeer={addPeerNode}
            onAddChild={addChildNode}
            onRemove={removeNode}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
