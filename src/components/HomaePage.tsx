"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Minus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Node {
  id: string;
  label: string;
  children: Node[];
  parentId: string | null;
  type: "director" | "subordinate" | "branch";
}

// const generateId = () => Math.random().toString(36).substring(2, 9);
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
  return (
    <div className="">
      {/* Node Box */}
      <div className="border px-5 py-2 w-full">
        <div
          className={`${
            node.type === "director"
              ? "w-full flex justify-center gap-3"
              : "w-full flex justify-between gap-2"
          } mt-4`}
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
                  className="w-4.5 h-4.5  text-white rounded-full flex items-center justify-center bg-green-700"
                  title="Add branch member"
                >
                  <Plus size={13} className="font-extrabold"/>
                </button>
              )}
              {node.type !== "director" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(node.id);
                  }}
                  className="w-4.5 h-4.5 text-white rounded-full flex items-center justify-center bg-red-700"
                >
                  <Minus size={13} className="font-extrabold"/>
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
              onClick={() => setShowMenu((prev) => !prev)}
              className="ml-2"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
            {showMenu && (
              <div className="absolute left-full top-0 mt-2 w-64 p-2 bg-white border rounded shadow z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubordinate(node.id);
                    setShowMenu(false);
                  }}
                  className="text-sm"
                >
                  Add a New Subordinate Branch
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
                ? "grid grid-cols-2 gap-4"
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

      if (!targetNode || targetNode.type !== "subordinate") return prevTree;

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
      <h1 className="text-xl font-bold mb-4">Organizational Structure</h1>
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

// const NodeComponent = ({
//   node,
//   onAddBranchMember,
//   onAddSubordinate,
//   onRemove,
// }: {
//   node: Node;
//   onAddBranchMember: (id: string) => void;
//   onAddSubordinate: (id: string) => void;
//   onRemove: (id: string) => void;
// }) => {
//   return (
//     <div className="mb-4">
//       <div className="border">
//       <div className="flex items-center justify-between gap-2 mb-1">
//         <div className=" border px-3 py-1 rounded bg-gray-50">
//           {node.label}

//         <div className="flex gap-1">
//           {node.type === "subordinate" && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onAddBranchMember(node.id);
//               }}
//               title="Add branch member"
//               className="h-6 w-6 p-0"
//             >
//               <Plus className="w-3 h-3" />
//             </Button>
//           )}

//           {node.type !== "director" && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onRemove(node.id);
//               }}
//               title="Remove"
//               className="h-6 w-6 p-0"
//             >
//               <Minus className="w-3 h-3" />
//             </Button>
//           )}

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={(e) => {
//               e.stopPropagation();
//               onAddSubordinate(node.id);
//             }}
//             title="Add subordinate branch"
//             className="h-6 w-6 p-0"
//           >
//             <MoreHorizontal className="w-3 h-3" />
//           </Button>

//         </div>

//         </div>
//       </div>

//       {/* Render Children */}
//       {node.children.length > 0 && (
//         <div className="ml-3 border-gray-200">
//           {node.children.map((child) => (
//             <NodeComponent
//               key={child.id}
//               node={child}
//               onAddBranchMember={onAddBranchMember}
//               onAddSubordinate={onAddSubordinate}
//               onRemove={onRemove}
//             />
//           ))}
//         </div>
//       )}
//       </div>
//     </div>
//   );
// };

// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { MoreHorizontal, Plus, Minus } from "lucide-react";
// interface Node {
//   id: string;
//   label: string;
//   children: Node[];
//   parentId: string | null;
//   type: "director" | "subordinate" | "branch";
// }

// const generateId = () => Math.random().toString(36).substring(2, 9);

// const buildLabelPath = (
//   nodes: Node[],
//   parentId: string | null,
//   index: number
// ): string => {
//   if (!parentId) return ""; // Director
//   const parent = findNodeById(nodes, parentId);
//   return parent ? `${parent.label}/${index}` : `${index}`;
// };

// const findNodeById = (nodes: Node[], id: string): Node | null => {
//   for (const node of nodes) {
//     if (node.id === id) return node;
//     const found = findNodeById(node.children, id);
//     if (found) return found;
//   }
//   return null;
// };

// const NodeComponent = ({
//   node,
//   onAddBranchMember,
//   onAddSubordinate,
//   onRemove,
// }: {
//   node: Node;
//   onAddBranchMember: (id: string) => void;
//   onAddSubordinate: (id: string) => void;
//   onRemove: (id: string) => void;
// }) => {
//   return (
//     <div className="border p-2 m-2 rounded bg-white shadow">
//       <div className="flex justify-between items-center">
//         <span className={node.type === "subordinate" ? "font-semibold" : ""}>
//           {node.label}
//         </span>
//         <div className="flex gap-1">
//           {node.type === "subordinate" && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => onAddBranchMember(node.id)}
//             >
//               <Plus className="w-4 h-4 text-green-600" />
//             </Button>
//           )}

//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => onAddSubordinate(node.id)}
//           >
//             <MoreHorizontal className="w-4 h-4 text-gray-600" />
//           </Button>
//           {node.type !== "director" && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => onRemove(node.id)}
//             >
//               <Minus className="w-4 h-4 text-red-600" />
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Render Children */}
//       <div className="ml-4 border-l border-gray-300 pl-2">
//         {node.children.map((child) => (
//           <NodeComponent
//             key={child.id}
//             node={child}
//             onAddBranchMember={onAddBranchMember}
//             onAddSubordinate={onAddSubordinate}
//             onRemove={onRemove}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// const getNextLabel = (parentNode: Node): string => {
//   const branchMembers = parentNode.children.filter(child => child.type === "branch");
//   const nextIndex = branchMembers.length + 1;
//   return `Branch ${nextIndex}`;
// };

// const OrgChart = () => {
//   const [tree, setTree] = useState<Node[]>([
//     {
//       id: "director",
//       label: "Director",
//       parentId: null,
//       type: "director",
//       children: [],
//     },
//   ]);

//   const addSubordinate = (parentId: string) => {
//     const newNodeId = generateId();

//     const updateTree = (nodes: Node[]): Node[] =>
//       nodes.map((node) => {
//         if (node.id === parentId) {
//           const count = node.children.length + 1;
//           const label = buildLabelPath(tree, parentId, count);

//           return {
//             ...node,
//             children: [
//               ...node.children,
//               {
//                 id: newNodeId,
//                 label:
//                   node.type === "director"
//                     ? `Subordinate ${count}`
//                     : `${label}`,
//                 parentId,
//                 type: "subordinate",
//                 children: [],
//               },
//             ],
//           };
//         }
//         return { ...node, children: updateTree(node.children) };
//       });

//     setTree(updateTree(tree));
//   };

//   const addBranchMember = (targetId: string) => {
//     const findParent = (
//       nodes: Node[],
//       targetId: string
//     ): { parent: Node | null; parentPath: Node[] } => {
//       for (const node of nodes) {
//         for (const child of node.children) {
//           if (child.id === targetId && child.type === "subordinate") {
//             return { parent: node, parentPath: [node] };
//           }
//           const result = findParent(node.children, targetId);
//           if (result.parent) {
//             return {
//               parent: result.parent,
//               parentPath: [node, ...result.parentPath],
//             };
//           }
//         }
//       }
//       return { parent: null, parentPath: [] };
//     };

//     const { parent } = findParent(tree, targetId);
//     if (!parent) return;

//     const updateTree = (nodes: Node[]): Node[] => {
//       return nodes.map((node) => {
//         if (node.id === parent.id) {
//           const count = node.children.filter((c) => c.type === "branch").length;
//           const newBranch: Node = {
//             id: generateId(),
//             label: getNextLabel(node),
//             parentId: node.id,
//             type: "branch",
//             children: [],
//           };
//           return {
//             ...node,
//             children: [...node.children, newBranch],
//           };
//         }

//         return {
//           ...node,
//           children: updateTree(node.children),
//         };
//       });
//     };

//     setTree(updateTree(tree));
//   };

//   const removeNode = (id: string) => {
//     const deleteNode = (nodes: Node[]): Node[] =>
//       nodes
//         .filter((node) => node.id !== id)
//         .map((node) => ({
//           ...node,
//           children: deleteNode(node.children),
//         }));

//     setTree(deleteNode(tree));
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold text-center mb-4">
//         Organizational Structure
//       </h2>
//       <div className="flex justify-center">
//         {tree.map((node) => (
//           <NodeComponent
//             key={node.id}
//             node={node}
//             onAddBranchMember={addBranchMember}
//             onAddSubordinate={addSubordinate}
//             onRemove={removeNode}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OrgChart;
