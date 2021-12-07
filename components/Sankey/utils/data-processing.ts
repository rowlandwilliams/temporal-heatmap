import { Province, SankeyLinkObj } from "./../../../types/types";
import { NodeObj, RawFlow } from "../../../types/types";

// nodes

// get all the unique nodes from raw data (origin or destination)
const getUniqueOriginsOrDestinations = (
  sankeyDataRaw: RawFlow[],
  key: string
) => {
  return [...new Set(sankeyDataRaw.map((rawFlowObj) => rawFlowObj[key]))];
};

// use unique nodes to get array of nodes object with name (for chart) and key (for sorting - left vs right side of sankey)
const getOriginsOrDestinationsWithNames = (
  uniqueOriginsOrDestinations: string[],
  identifier: string,
  provinces: Province[],
  offset = 0
) => {
  return uniqueOriginsOrDestinations.map((originObj, i) => ({
    node: i + offset,
    name: originObj,
    key: identifier,
    province: provinces.filter((province) => province.code === originObj)[0]
      .name,
  }));
};

// get full node sets with unique id for each node on left or right of sankey
export const getNodesFromRawData = (
  sankeyDataRaw: RawFlow[],
  provinces: Province[]
) => {
  const origins = getUniqueOriginsOrDestinations(sankeyDataRaw, "origin");
  const destinations = getUniqueOriginsOrDestinations(sankeyDataRaw, "dest");

  const originsWithNames = getOriginsOrDestinationsWithNames(
    origins as string[],
    "origin",
    provinces
  );
  const destinationsWithNames = getOriginsOrDestinationsWithNames(
    destinations as string[],
    "dest",
    provinces,
    originsWithNames.length
  );

  const allNodes: NodeObj[] = originsWithNames.concat(destinationsWithNames);
  return allNodes;
};

// links

// get node for each raw flow based on which node is in source / destination keys
const getSourceOrDestinationNode = (
  nodes: NodeObj[],
  rawFlowObj: RawFlow,
  key: string
) => {
  return nodes.filter(
    (node) => node.name === rawFlowObj[key] && node.key === key
  )[0].node;
};

// get sankey ready link object with correct source / target node ids and corresponding value
export const getLinksFromRawData = (
  nodes: NodeObj[],
  sankeyDataRaw: RawFlow[]
) => {
  const links: SankeyLinkObj[] = sankeyDataRaw.map((rawFlowObj) => ({
    source: getSourceOrDestinationNode(nodes, rawFlowObj, "origin"),
    target: getSourceOrDestinationNode(nodes, rawFlowObj, "dest"),
    value: rawFlowObj.count,
  }));
  return links;
};

export const getSankeyDataFromRaw = (
  sankeyDataRaw: RawFlow[],
  provinces: Province[]
) => {
  const nodes = getNodesFromRawData(sankeyDataRaw, provinces);
  const links = getLinksFromRawData(nodes, sankeyDataRaw);

  const finalData = { nodes: nodes, links: links };

  return finalData;
};