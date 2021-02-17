// @ts-nocheck
import { React, useState, useEffect } from "react";
import {
  Button,
  EditorToolbarButton,
  SkeletonBodyText,
  SkeletonContainer,
  TextInput,
  Paragraph,
  Card,
} from "@contentful/forma-36-react-components";
import { FieldExtensionSDK } from "contentful-ui-extensions-sdk";
import { v4 as uuid } from "uuid";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const RepeatableReferenceField = (props: FieldProps) => {
  const fieldValue = props.sdk.field.getValue();
  const initialRows = fieldValue
    ? fieldValue.map((value) => ({ ...value, key: uuid() }))
    : [];
  const [rows, setRows] = useState(initialRows);
  const instanceParameters = props.sdk.parameters.instance;
  const referenceKey = instanceParameters.referenceKey || "id";
  const textKey = instanceParameters.textKey || "text";
  const textLabel = instanceParameters.textLabel || "Text";
  const contentTypes = instanceParameters.contentTypes
    ? instanceParameters.contentTypes.split(/\s*,\s*/g)
    : null;

  // use contentful's builtin auto-resizer
  useEffect(() => {
    props.sdk.window.startAutoResizer();
  });

  // check for unresolved names and fetch them from contenful if neccessary
  useEffect(() => {
    const unpopulatedRows = rows.filter((row) => !row.name);
    if (!unpopulatedRows.length) {
      return;
    }

    const referencedIds = rows.map((row) => row[referenceKey]);
    props.sdk.space
      .getEntries({ "sys.id[in]": referencedIds })
      .then((queryResult) => {
        let populatedRows = rows.map((row) => {
          const resultForCurrentRow = queryResult.items
            .filter((entry) => entry.sys.id === row[referenceKey])
            .pop();
          return {
            name: resultForCurrentRow
              ? resultForCurrentRow.fields.title["en-US"]
              : "",
            ...row,
          };
        });
        setRows(populatedRows);
      });
  }, [rows, props.sdk.space, referenceKey]);

  // update contentful field value whenever rows data changes
  useEffect(() => {
    const sanitizedRows = rows.map((row) => {
      const sanitizedRow = {};
      sanitizedRow[textKey] = row[textKey];
      sanitizedRow[referenceKey] = row[referenceKey];
      return sanitizedRow;
    });
    props.sdk.field.setValue(sanitizedRows);
  }, [rows, props.sdk.field, referenceKey, textKey]);

  // open entry selection dialog and append selected entries to the end of our list
  const onAddButtonClicked = () => {
    const options = {};
    if (contentTypes) {
      options.contentTypes = contentTypes;
    }
    props.sdk.dialogs
      .selectMultipleEntries(options)
      .then((selectedRows) => {
        setRows([
          ...rows,
          ...selectedRows.map((row) => {
            const rowData = {
              key: uuid(),
            };
            rowData[textKey] = "";
            rowData[referenceKey] = row.sys.id;
            return rowData;
          }),
        ]);
      })
      .catch(() => {
        /* do nothing */
      });
  };

  // update ingredients with new amount
  const onTextChanged = (e) => {
    const rowIndex = e.target.dataset.index;
    const updatedRows = [...rows];
    updatedRows[rowIndex][textKey] = e.target.value;
    setRows(updatedRows);
  };

  // remove ingredient from list
  const onDeleteButtonClicked = (passedRow) => {
    const updatedRows = rows.filter((row) => row !== passedRow);
    setRows(updatedRows);
  };

  // Called when ingredient is re-ordered
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    setRows((prevRows) => {
      const result = Array.from(prevRows);
      const [removed] = result.splice(source.index, 1);
      result.splice(destination.index, 0, removed);
      return result;
    });
  };

  return (
    <section>
      <div>
        <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
          <Droppable droppableId="rows">
            {(provided) => {
              return (
                <div ref={provided.innerRef} className="rows">
                  {rows.map((row, index) => {
                    return (
                      <Draggable
                        key={`${row.id}-${index}`}
                        draggableId={`${row.id}-${index}`}
                        index={index}
                      >
                        {(provided) => {
                          return (
                            <div
                              key={row.key}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              style={{
                                userSelect: "none",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <Card className="row">
                                <div>
                                  <TextInput
                                    value={row[textKey]}
                                    placeholder={textLabel}
                                    data-index={index}
                                    onChange={onTextChanged}
                                  ></TextInput>
                                </div>
                                <div style={{ width: "200px" }}>
                                  {row.name ? (
                                    <Paragraph>{row.name}</Paragraph>
                                  ) : (
                                    <SkeletonContainer svgHeight="20">
                                      <SkeletonBodyText numberOfLines="1"></SkeletonBodyText>
                                    </SkeletonContainer>
                                  )}
                                </div>
                                <div className="delete">
                                  <EditorToolbarButton
                                    icon="Delete"
                                    data-index={index}
                                    onClick={() => onDeleteButtonClicked(row)}
                                  ></EditorToolbarButton>
                                </div>
                              </Card>
                            </div>
                          );
                        }}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>
      </div>
      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <Button icon="Plus" buttonType="naked" onClick={onAddButtonClicked}>
          Add
        </Button>
      </div>
    </section>
  );
};

export default RepeatableReferenceField;
