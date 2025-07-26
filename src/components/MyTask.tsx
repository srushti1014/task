"use client"
import React from 'react'
import { v4 as uuidv4 } from 'uuid';

interface Node {
    id: string,
    label: string,
    children: Node[],
    parentId: string | null,
    type: "director" | "subordinate" | "branch"
}

const generateId = () => uuidv4();

const findNodeById = (nodes: Node[], id: string): Node | null => {
    for(const node of nodes){
        if(node.id === id){
            return node;
        }
        const found = findNodeById(node.children, id);
        if(found){
            return found;
        }
    }
    return null
}

const getNextSubordinateLabel = (parentNode: Node): string=> {
    if(parentNode.type === "director"){
        const subordinates = parentNode.children.filter((child) => child.type === "subordinate")
        return `Subordinate ${subordinates.length + 1}`
    }else {
    const subordinates = parentNode.children.filter(
      (child) => child.type === "subordinate"
    );
    return `${parentNode.label}/${subordinates.length + 1}`;
  }
}

const MyTask = () => {
  return (
    <div>MyTask</div>
  )
}

export default MyTask