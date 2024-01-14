import { Stage, Layer, Rect, Transformer } from 'react-konva';
// import { Textfield } from '@material-ui/core';
import React, { useState } from 'react';

    const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, shapeGroups, allShapes}) => {
        const shapeRef = React.useRef();
        const trRef = React.useRef();
        // const [allShapesCoordDiff, setAllShapesCoordDiff] = useState([]);
        const allShapesCoordDiff = [];
        const [coordDiffArray, setCoordDiffArray] = useState();
        // const allShapesCopy = [...allShapes];
        const shapeGroupsCopy = [...shapeGroups];
        const [currentShapeGroupIndex, setCurrentShapeGroupIndex] = useState();
        const [currentShapeIndex, setCurrentShapeIndex] = useState();
        let currentShape;
        React.useEffect(() => {
          if (isSelected){
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
          }
          }, [isSelected]);

          // if (allShapes.length > 0){
          //   let notSelectedShapes = allShapes.filter((shape) => {return ((shape.id !== shapeProps.id) && (shape.shapeType === shapeProps.shapeType))});
          //   notSelectedShapes.map((shape) => {shape.x});
          // }


        return (
          <React.Fragment>
            <Rect
              onClick={onSelect}
              onTap={onSelect}
              ref={shapeRef}
              {...shapeProps}
              draggable
///////////////////////////////// moves all shapes when one is moved, change this, pass in groups and find which group the moving shape is in and change that group only
              onDragStart={(e) => {
                if(!isSelected){
                currentShape = e.target.getAttrs();
                let currentShapeGroupIndex = shapeGroupsCopy.findIndex((shapeGroup) => {return ((shapeGroup.groupMembers.findIndex((shape) => {return ((shape.shapeType === currentShape.shapeType) && (shape.id === currentShape.id))})) >= 0)});
                if(currentShapeGroupIndex >= 0){
                  shapeGroupsCopy[currentShapeGroupIndex].groupMembers.forEach((shape, index) => {
                  if((shape.id === currentShape.id) && (shape.shapeType === currentShape.shapeType)){
                    setCurrentShapeIndex(index);
                    allShapesCoordDiff[index] = {x: shape.x - shapeProps.x, y: shape.y - shapeProps.y};
                  } else {
                    allShapesCoordDiff[index] = {x: shape.x - shapeProps.x, y: shape.y - shapeProps.y};
                  };
                  setCoordDiffArray(allShapesCoordDiff);
                });
              };
              setCurrentShapeGroupIndex(currentShapeGroupIndex);
            };
              }}

              onDragMove={(e) => {
                if(currentShapeGroupIndex >= 0){
                if(!isSelected && currentShapeIndex >=0){

                    shapeGroupsCopy[currentShapeGroupIndex].groupMembers.forEach((shape, index) => {
                    if((currentShapeIndex !== index)){
                    shapeGroupsCopy[currentShapeGroupIndex].groupMembers[index].x = (e.target.x() + coordDiffArray[index].x);
                    shapeGroupsCopy[currentShapeGroupIndex].groupMembers[index].y = (e.target.y() + coordDiffArray[index].y);
                    } else {
                      shapeGroupsCopy[currentShapeGroupIndex].groupMembers[index].x = e.target.x();
                      shapeGroupsCopy[currentShapeGroupIndex].groupMembers[index].y = e.target.y();
                    };
                  });
              };
            };
              onChange({
                ...shapeProps,
                x: e.target.x(),
                y: e.target.y(),
              });
              }}
/////////////////////////////////
              onDragEnd={(e) => {
                onChange({
                  ...shapeProps,
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e) => {
                  // transformer is changing scale of the node
                // and NOT its width or height
                // but in the store we have only width and height
                // to match the data better we will reset scale on transform end
                const node = shapeRef.current;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
      
                // we will reset it back
                node.scaleX(1);
                node.scaleY(1);
                onChange({
                  ...shapeProps,
                  x: node.x(),
                  y: node.y(),
                  // set minimal value
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(node.height() * scaleY),
                });
              }}
            />
            {isSelected && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // limit resize
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </React.Fragment>
        );
      };
      
      const initialRectangles = [
        {
          x: 10,
          y: 10,
          width: 100,
          height: 100,
          fill: 'red',
          id: '1',
          shapeType: 'rect'
        },
        {
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          fill: 'green',
          id: '2',
          shapeType: 'rect'
        },
      ];
      
      const SketchPage = () => {

        const [allShapes, setAllShapes] = useState(initialRectangles);
        const [selectedId, selectShape] = useState(null);
        const [selectedShape, setSelectedShape] = useState(null);
        const [groupNameInput, setGroupNameInput] = useState('');
        const [shapeGroups, setShapeGroups] = useState([]);
        let newRect = {
          x: 10,
          y: 10,
          width: 100,
          height: 100,
          fill: 'yellow',
          id: '0',
          shapeType: 'rect'
        };

        const GenerateUniqueShapeId = (shapeType, shapeArray) => {
          let j = 1;
          let i = 0;
          let foundUniqueIndex = false;
          let uniqueId = '';
          const remainingShapes = [...shapeArray];
          
          while (!foundUniqueIndex) {
            if(remainingShapes.length === 0){
              uniqueId = j.toString();
              foundUniqueIndex = true;
              break;
            };

          if((remainingShapes[i].id === j.toString()) && (remainingShapes[i].shapeType === shapeType)){
            remainingShapes.splice(i, 1);
            j++;
            i = 0;
          }
          else {
            if(remainingShapes[i].shapeType !== shapeType){
              remainingShapes.splice(i, 1);
            } 
            else {
              i++;
            };
          };

          if((remainingShapes.length === i)){
            uniqueId = j.toString();
            foundUniqueIndex = true;
            setSelectedShape(null);
            selectShape(null);
            break;
          };
        };
        return uniqueId;
      };

        const checkDeselect = (e) => {
          // deselect when clicked on empty area
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            selectShape(null);
            setSelectedShape(null);
          }
        };

        const handleAddRectClick = () => {
          //generates a unique shape id based on existing shape ids

          let uniqueId = GenerateUniqueShapeId('rect', allShapes);
          newRect.id = uniqueId;
          const newAllShapes = [...allShapes, newRect];
          selectShape(newRect.id);
          setSelectedShape(newRect);
          setAllShapes(newAllShapes);
        };

        const handleDeleteShape = () => {
          const matchingShapeIndex = allShapes.findIndex((shape) => {
            return shape.id === selectedId;
          });
          if(matchingShapeIndex !== -1) {
            const lessShapes = [...allShapes];
            lessShapes.splice(matchingShapeIndex, 1);
            setAllShapes(lessShapes);
          };
          // make group names unique, refactor add uniqueId generator to use groupShapes
          let shapeIndex;
          let groupMemberIndex;
          if(selectedShape && shapeGroups.length > 0 && shapeGroups.findIndex((shapeGroup) => {return (shapeGroup.groupMembers.length > 0? true: false)}) >= 0){
          groupMemberIndex = shapeGroups.findIndex((shapeGroup) => {
            shapeIndex = shapeGroup.groupMembers.findIndex((groupMember) => {
              return ((groupMember.shapeType === selectedShape.shapeType) && (groupMember.id === selectedShape.id));
            });
            return shapeIndex === -1 ? false : true;
          });
        };

        if(shapeIndex >= 0 && groupMemberIndex >= 0){
          setSelectedShape(null);
          selectShape(null);
          let updateShapeGroups = [...shapeGroups];
          updateShapeGroups[groupMemberIndex].groupMembers.splice(shapeIndex, 1);
          setShapeGroups(updateShapeGroups);

        }

        };

        const handleGroupNameInputChange = (e) => {
          setGroupNameInput(e.target.value);
        };

        const handleAddToGroupClick = () => {
          //find which group shape is in if any

          // create new group name if nonexistent
          //check if shape to be added is in a different group and delete it
          // add shape to that group

          let currentGroupName = groupNameInput;
          let shapeIndex;
          let currentGroupIndex;
          let shapeExistingGroupIndex;
          if(currentGroupName.length > 0 && selectedShape){
            if(shapeGroups.length > 0){
            //returns index of the input groupname in shapegroups array, -1 if not found
            currentGroupIndex = shapeGroups.findIndex((shapeGroup) => {
            return (shapeGroup.groupName === currentGroupName)});

            //finds the index of the group in shapegroups in which the selected shape is found if any
            //and the index where the shape was found at in the group member array
            shapeExistingGroupIndex = shapeGroups.findIndex((shapeGroup) => {
              shapeIndex = shapeGroup.groupMembers.findIndex((groupMember) => {
                return ((groupMember.shapeType === selectedShape.shapeType) && (groupMember.id === selectedShape.id));
              });
              return (shapeIndex >= 0)
            });
          } else {
            shapeExistingGroupIndex = -1;
            currentGroupIndex = -1;
          };

            let newShapeGroups = [...shapeGroups];
            //input group is already a group and the selected shape is in a different group
          if(currentGroupIndex >= 0 && (shapeExistingGroupIndex !== currentGroupIndex)){

                //input group already exists and selected shape is part of a group
                if (shapeExistingGroupIndex >= 0) {
                newShapeGroups[shapeExistingGroupIndex].groupMembers.splice(shapeIndex, 1);
                };
                newShapeGroups[currentGroupIndex].groupMembers.push(selectedShape);
                setShapeGroups(newShapeGroups);
          } else if (currentGroupIndex === -1){
              if(shapeExistingGroupIndex >= 0){
                newShapeGroups[shapeExistingGroupIndex].groupMembers.splice(shapeIndex, 1);
              };
                setShapeGroups([...newShapeGroups, {groupName: currentGroupName, groupMembers: [selectedShape]}]);
            };
          };
        };

        const handleCopyShapeClick = () => {
          if (selectedId >= 0){
          let uniqueId = GenerateUniqueShapeId('rect', allShapes);
          //doesn't work
          let copiedShape = {selectedShape};
          copiedShape.id = uniqueId;
          copiedShape.x = 10;
          copiedShape.y = 10;
          selectShape(uniqueId);
          setSelectedShape(copiedShape);
          setAllShapes([...allShapes, {selectedShape}]);
          };
        };
      
        return (
          <>
          <button type="input" style={{ width: '100px', height: '20px' }} onClick={handleAddRectClick}>Add rectangle</button>
          <button type="input" style={{ width: '100px', height: '20px' }} onClick={handleDeleteShape}>Delete shape</button>
          <button type="input" style={{ width: '100px', height: '20px' }} value={null} onClick={handleAddToGroupClick}>Add to group</button>
          <button type="input" style={{ width: '100px', height: '20px' }} value={null} onClick={handleCopyShapeClick}>Copy Shape</button>
          <div>
            <label>Group name: </label>
            <input type='text' onChange={handleGroupNameInputChange}></input>
          </div>
          <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
          >
            <Layer>
              {allShapes.length && allShapes.filter((shape) => {return (shape.shapeType === 'rect')}).map((rect, i) => {
                return (
                  <Rectangle
                    key={i}
                    allShapes={allShapes}
                    setAllShapes={setAllShapes}
                    shapeGroups={shapeGroups}
                    setShapeGroups={setShapeGroups}
                    shapeProps={rect}
                    isSelected={rect.id === selectedId}
                    onSelect={() => {
                      selectShape(rect.id);
                      setSelectedShape(rect);
                      let previousShapeIndex;
                      let previousShapeGroupIndex = shapeGroups.findIndex((shapeGroup) => {previousShapeIndex = shapeGroup.groupMembers.findIndex((groupMember) => {return groupMember.id === rect.id}); return previousShapeIndex >= 0; });
                      if (previousShapeIndex >= 0 && previousShapeGroupIndex >= 0){
                        shapeGroups[previousShapeGroupIndex].groupMembers[previousShapeIndex] = rect;
                      };
                    }}

                    onChange={(newAttrs) => {
                      const allShapesCopy = allShapes.slice();
                      let rectIndexToUpdate = allShapes.findIndex((shape) => {return (shape.shapeType === newAttrs.shapeType) && (shape.id === newAttrs.id)});

                      allShapesCopy[rectIndexToUpdate] = newAttrs;
                      if(shapeGroups.length > 0){
                      let updateShapeGroups = [...shapeGroups];
                      let previousShapeIndex;
                      let previousShapeGroupIndex = updateShapeGroups.findIndex((shapeGroup) => {previousShapeIndex = shapeGroup.groupMembers.findIndex((groupMember) => {return groupMember.id === rect.id}); return previousShapeIndex >= 0; });
                      if (previousShapeIndex >= 0 && previousShapeGroupIndex >= 0){
                        updateShapeGroups[previousShapeGroupIndex].groupMembers[previousShapeIndex] = newAttrs;
                      };
                      
                      setShapeGroups(updateShapeGroups);
                      };
                      if(selectedShape){
                        setSelectedShape(newAttrs);
                      };
                      setAllShapes(allShapesCopy);
                    }}
                  />
                );
              })}
            </Layer>
          </Stage>
          </>
        );
      };

export default SketchPage;