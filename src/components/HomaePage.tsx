"use client";
import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Plus, Minus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Node {
  id: string;
  label: string;
  children: Node[];
  parentId: string | null;
  type: "director" | "subordinate" | "branch";
}

const generateId = () => uuidv4();

const findNodeById = (nodes: Node[], id: string): Node | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
};

const getNextSubordinateLabel = (parentNode: Node): string => {
  if (parentNode.type === "director") {
    const subordinates = parentNode.children.filter(
      (child) => child.type === "subordinate"
    );
    return `Subordinate ${subordinates.length + 1}`;
  } else {
    const subordinates = parentNode.children.filter(
      (child) => child.type === "subordinate"
    );
    return `${parentNode.label}/${subordinates.length + 1}`;
  }
};

const getNextBranchMemberLabel = (parentNode: Node): string => {
  const branchMembers = parentNode.children.filter(
    (child) => child.type === "branch"
  );
  const labelPart = parentNode.label.split("Subordinate ").pop();
  return `Branch member ${labelPart}/${branchMembers.length + 1}`;
};

const NodeComponent = ({
  node,
  onAddBranchMember,
  onAddSubordinate,
  onRemove,
}: {
  node: Node;
  onAddBranchMember: (id: string) => void;
  onAddSubordinate: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<"right" | "left">("right");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as HTMLElement)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showMenu || !menuButtonRef.current) return;

    const rect = menuButtonRef.current.getBoundingClientRect();
    const screenWidth = window.innerWidth;

    if (screenWidth - rect.right < 200) {
      setMenuPosition("left");
    } else {
      setMenuPosition("right");
    }
  }, [showMenu]);

  return (
    <div className="">
      <div className="border px-5 py-2 w-full"
      >
        <div
          className={`${
            node.type === "director"
              ? "w-[150px] mx-auto flex justify-center items-center border gap-3 p-4"
              : "w-full flex justify-between gap-2"
          } my-4`}
          // className="w-full flex justify-between gap-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <p>{node.label}</p>
            <div className="flex gap-1">
              {node.type === "subordinate" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBranchMember(node.id);
                  }}
                  className="w-4.5 h-4.5 cursor-pointer text-white rounded-full flex items-center justify-center bg-green-700"
                  title="Add branch member"
                >
                  <Plus size={13} className="font-extrabold" />
                </button>
              )}
              {node.type !== "director" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(node.id);
                  }}
                  className="w-4.5 h-4.5 cursor-pointer text-white rounded-full flex items-center justify-center bg-red-700"
                >
                  <Minus size={13} className="font-extrabold" />
                </button>
              )}
            </div>
          </div>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddSubordinate(node.id);
            }}
            className="h-6 w-6 p-0"
            title="Add Subordinate"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button> */}
          <div className="relative inline-block text-left">
            <button
              ref={menuButtonRef}
              onClick={() => setShowMenu((prev) => !prev)}
              className="ml-2 cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div
                ref={menuRef}
                // className="absolute left-full top-0 mt-2 w-64 bg-white border rounded shadow z-10"
                className={`absolute top-2.5 mt-2 w-64 p-0.5 bg-white border rounded shadow z-10
                  ${menuPosition === "right" ? "left-3" : "right-0"}
                `}
              >
                <button
                  //   onClick={(e) => {
                  //     e.stopPropagation();
                  //     onAddSubordinate(node.id);
                  //     setShowMenu(false);
                  //   }}
                  //   className="text-sm"
                  // >
                  //   Add a New Subordinate Branch
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (node.type === "branch") {
                      onAddBranchMember(node.id);
                    } else {
                      onAddSubordinate(node.id);
                    }
                  }}
                  className="text-sm cursor-pointer p-2 "
                >
                  {node.type === "branch"
                    ? "Add a sub Branch Member"
                    : "Add a New Subordinate Branch"}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Children */}
        {node.children.length > 0 && (
          // <div className="grid grid-cols-2 gap-2 mt-4">
          <div
            className={`${
              node.type === "director"
                ? "grid grid-cols-2 gap-10"
                : "flex flex-col gap-2"
            } mt-4`}
          >
            {node.children.map((child) => (
              <NodeComponent
                key={child.id}
                node={child}
                onAddBranchMember={onAddBranchMember}
                onAddSubordinate={onAddSubordinate}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
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
      type: "director",
      children: [],
    },
  ]);

  const addSubordinate = (parentId: string) => {
    setTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree));
      const parentNode = findNodeById(newTree, parentId);

      if (!parentNode) return prevTree;

      const newSubordinate: Node = {
        id: generateId(),
        label: getNextSubordinateLabel(parentNode),
        parentId: parentNode.id,
        type: "subordinate",
        children: [],
      };

      parentNode.children.push(newSubordinate);
      return newTree;
    });
  };

  const addBranchMember = (targetId: string) => {
    setTree((prevTree) => {
      const newTree = JSON.parse(JSON.stringify(prevTree));
      const targetNode = findNodeById(newTree, targetId);

      // if (!targetNode || targetNode.type !== "subordinate") return prevTree;
      if (
        !targetNode ||
        (targetNode.type !== "subordinate" && targetNode.type !== "branch")
      )
        return prevTree;

      const newBranchMember: Node = {
        id: generateId(),
        label: getNextBranchMemberLabel(targetNode),
        parentId: targetNode.id,
        type: "branch",
        children: [],
      };

      targetNode.children.push(newBranchMember);
      return newTree;
    });
  };

  const removeNode = (id: string) => {
    setTree((prevTree) => {
      const deleteNode = (nodes: Node[]): Node[] => {
        return nodes
          .filter((node) => node.id !== id)
          .map((node) => ({
            ...node,
            children: deleteNode(node.children),
          }));
      };
      return deleteNode(prevTree);
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-[42px] text-center font-bold my-7">
        Organizational Structure
      </h1>
      <div className="w-full">
        {tree.map((node) => (
          <NodeComponent
            key={node.id}
            node={node}
            onAddBranchMember={addBranchMember}
            onAddSubordinate={addSubordinate}
            onRemove={removeNode}
          />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
