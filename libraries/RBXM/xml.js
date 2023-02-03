/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/
const parseXML = (xml) => {
    const xmlDoc = new DOMParser().parseFromString(xml, "text/xml").documentElement
    const TYPES = []
    Object.values(xmlDoc.children).forEach(child => {
        if (child.tagName == "Item") {
            parseItem(TYPES, child)
        }
    })
    console.log(xmlDoc)
    return TYPES
}
const parseItem = (TYPES, child) => {
    const instance =  {
        Index: child.getAttribute("referent"),
        ClassName: child.className,
        Properties: null
    }
    Object.values(child.children).forEach(node => {
        if (node.tagName == "Item") {
            const item = parseItem(TYPES, node)
            item.Properties.Parent = instance.Index
        } else if (node.tagName == "Properties") {
            instance.Properties = parseProps(node)
        }
    })
    TYPES.push(instance)
    return instance
}
const parseProps = (child) => {
    const properties = {}
    Object.values(child.children).forEach(node => {
        if (["CoordinateFrame", "Vector2", "Vector3", "Custom", "PhysicalProperties"].indexOf(node.tagName) != -1) {
            properties[node.getAttribute("name")] = 
                `${node.tagName.includes("Vector") ? node.tagName : node.getAttribute("name")}.new(${node.textContent.replace(/\s+/g,' ').split(' ').filter((el) => {return el != ""}).join(',')})`
        } else {
            properties[node.getAttribute("name")] = node.textContent
        }
    })
    return properties
}