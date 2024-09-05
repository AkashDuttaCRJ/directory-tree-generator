"use client";

import { cn } from "@/lib/utils";
import { elementToSVG, inlineResources } from "dom-to-svg";
import { Copy, Download } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
// @ts-expect-error svgo is not typed
import { optimize } from "svgo/dist/svgo.browser.js";
import { Button } from "./ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Textarea } from "./ui/textarea";

type TreeObject =
  | {
      type: "folder";
      name: string;
      children: TreeObject[];
      comment?: string;
    }
  | {
      type: "file";
      name: string;
      comment?: string;
    };

const tree: TreeObject = {
  type: "folder",
  name: "seller-dashboard",
  children: [
    {
      type: "folder",
      name: "src",
      children: [
        {
          type: "folder",
          name: "apis",
          children: [
            {
              type: "folder",
              name: "graphql",
              children: [],
              comment: "graphql apis",
            },
            {
              type: "folder",
              name: "rest",
              children: [],
              comment: "rest apis",
            },
          ],
        },
        {
          type: "folder",
          name: "components",
          children: [],
          comment: "custom components",
        },
        {
          type: "folder",
          name: "constants",
          children: [
            {
              type: "file",
              name: "orders.js",
              comment: "order tabs and path constants",
            },
            {
              type: "file",
              name: "settings.js",
              comment: "settings tabs",
            },
          ],
        },
        {
          type: "folder",
          name: "elements",
          children: [],
          comment: "shadcn/ui components",
        },
        {
          type: "folder",
          name: "helpers",
          children: [],
          comment: "helper functions",
        },
        {
          type: "folder",
          name: "lib",
          children: [],
          comment: "typescript types and utility functions",
        },
        {
          type: "folder",
          name: "pages",
          children: [],
          comment: "pages for the seller dashboard",
        },
        {
          type: "folder",
          name: "schema",
          children: [],
          comment: "schemas for form validation",
        },
        {
          type: "folder",
          name: "services",
          children: [],
          comment:
            "service configurations (axios, graphql etc.) and custom hooks",
        },
        {
          type: "folder",
          name: "utils",
          children: [],
          comment: "api url endpoints",
        },
        {
          type: "file",
          name: "App.js",
          comment: "app router root",
        },
        {
          type: "file",
          name: "index.js",
          comment: "entry point for the seller dashboard",
        },
      ],
    },
    {
      type: "file",
      name: "package.json",
    },
  ],
};

const deepSort = (tree: TreeObject): TreeObject => {
  // if type is file, return the file
  if (tree.type === "file") {
    return tree;
  }

  // if type is folder, sort the children (folders first in alphabetical order, then files in alphabetical order)
  // and return the folder with sorted children
  const sortedChildren = tree.children.map(deepSort).sort((a, b) => {
    if (a.type === "folder" && b.type === "file") {
      return -1;
    } else if (a.type === "file" && b.type === "folder") {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return {
    ...tree,
    children: sortedChildren,
  };
};

const FolderIcon = () => {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.8333 5H9.16663L7.49996 3.33333H3.33329C2.41663 3.33333 1.66663 4.08333 1.66663 5V15C1.66663 15.9167 2.41663 16.6667 3.33329 16.6667H16.25C16.9583 16.6667 17.5 16.125 17.5 15.4167V6.66667C17.5 5.75 16.75 5 15.8333 5Z"
        fill="#FFA000"
      />
      <path
        d="M17.5834 7.5H6.37504C5.58337 7.5 4.87504 8.08333 4.75004 8.875L3.33337 16.6667H16.5417C17.3334 16.6667 18.0417 16.0833 18.1667 15.2917L19.2084 9.45833C19.4167 8.45833 18.625 7.5 17.5834 7.5Z"
        fill="#FFCA28"
      />
    </svg>
  );
};

const FileIcon = () => {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.6667 18.75H3.33337V1.25H12.5L16.6667 5.41667V18.75Z"
        fill="#90CAF9"
      />
      <path
        d="M16.0417 5.83333H12.0834V1.875L16.0417 5.83333Z"
        fill="#E1F5FE"
      />
    </svg>
  );
};

const TreeItem = ({
  item,
  depth,
  className,
  isLast,
}: {
  item: TreeObject;
  depth: number;
  className?: string;
  isLast?: boolean;
}) => {
  const isFile = item.type === "file";

  return (
    <div className={cn("relative", className)}>
      {depth > 0 && (
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 border-l-2 border-gray-300",
            isLast ? "h-3" : "h-full"
          )}
          style={{ left: `${(depth - 1) * 20}px` }}
        />
      )}
      <div
        className="relative flex items-center gap-1"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {depth > 0 && (
          <div
            className="absolute left-0 top-1/2 w-5 border-t-2 border-gray-300"
            style={{ left: `${(depth - 1) * 20}px` }}
          />
        )}
        {isFile ? <FileIcon /> : <FolderIcon />}
        <span className="font-sans text-sm p-0.5">{item.name}</span>
        {item.comment && (
          <span className="text-xs text-gray-500 ml-2">{`// ${item.comment}`}</span>
        )}
      </div>
      {!isFile && item.children && item.children.length > 0 && (
        <div className="mt-1 ml-2">
          {item.children.map((child, index) => (
            <TreeItem
              key={child.name}
              item={child}
              depth={depth + 1}
              isLast={index === item.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DirTree = forwardRef<HTMLDivElement, { text: string; depth: number }>(
  ({ text, depth }, ref) => {
    const tree = JSON.parse(text);
    const sortedTree = deepSort(tree);
    return (
      <div ref={ref} className="flex flex-col gap-2 p-5 bg-white rounded">
        <TreeItem item={sortedTree} depth={depth} />
      </div>
    );
  }
);

DirTree.displayName = "DirTree";

export const MainSection: React.FC = () => {
  const [text, setText] = useState(JSON.stringify(tree, null, 2));

  const depth = useRef(0).current;
  const treeRef = useRef<HTMLDivElement | null>(null);

  const getSvg = async () => {
    if (!treeRef.current) return;
    const svgDocument = elementToSVG(treeRef.current);
    await inlineResources(svgDocument.documentElement);
    const svgString = new XMLSerializer().serializeToString(svgDocument);
    const { data: optimizedString } = optimize(svgString);
    return optimizedString;
  };

  const copySvg = async () => {
    const svgString = await getSvg();
    if (!svgString) return;
    navigator.clipboard.writeText(svgString);
  };

  const downloadSvg = async () => {
    const svgString = await getSvg();
    if (!svgString) return;

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tree.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel className="p-10 min-w-96">
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          className="w-full h-full resize-none font-mono"
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="min-w-96">
        <div className="flex flex-col items-center justify-center w-full h-full gap-5 p-10">
          <div className="flex items-center justify-center flex-1">
            <DirTree ref={treeRef} text={text} depth={depth} />
          </div>
          <div className="flex items-center gap-4">
            <Button className="gap-2" onClick={copySvg}>
              <Copy size={16} />
              <span>Copy</span>
            </Button>
            <Button className="gap-2" onClick={downloadSvg}>
              <Download size={16} />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
