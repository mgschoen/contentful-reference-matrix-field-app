// @ts-nocheck
import { React, useState, useEffect } from 'react';
import {
  Button,
  EditorToolbarButton,
  SkeletonBodyText,
  SkeletonContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextInput
} from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const RepeatableReferenceField = (props: FieldProps) => {
  const fieldValue = props.sdk.field.getValue();
  const [rows, setRows] = useState(fieldValue || []);

  // use contentful's builtin auto-resizer 
  useEffect(() => {
    props.sdk.window.startAutoResizer();
  })

  // check for unresolved names and fetch them from contenful if neccessary
  useEffect(() => {
    const unpopulatedRows = rows.filter((row) => !row.name);
    if (!unpopulatedRows.length) {
      return;
    }

    const ids = rows.map((row) => row.id);
    props.sdk.space.getEntries({ 'sys.id[in]': ids }).then((queryResult) => {
      let populatedRows = rows.map((row) => {
        const resultForCurrentRow = queryResult.items.filter((entry) => entry.sys.id === row.id).pop();
        return {
          name: resultForCurrentRow ? resultForCurrentRow.fields.title['en-US'] : '',
          ...row
        }
      });
      setRows(populatedRows);
    });
  }, [rows, props.sdk.space]);

  // update contentful field value whenever rows data changes
  useEffect(() => {
    const sanitizedRows = rows.map((row) => {
      return { amount: row.amount, id: row.id };
    });
    props.sdk.field.setValue(sanitizedRows);
  }, [rows, props.sdk.field]);

  // open entry selection dialog and append selected entries to the end of our list
  const onAddButtonClicked = () => {
    props.sdk.dialogs.selectMultipleEntries({contentTypes: ['ingredient']})
      .then((selectedRows) => {
        setRows([
          ...rows,
          ...selectedRows.map((row) => { 
            return {
              amount: '',
              id: row.sys.id,
              key: `${row.sys.id}-${Math.floor(Math.random() * 100000)}`
            }
          })
        ]);
        props.sdk.field.setValue(rows);
      })
      .catch(() => { /* do nothing */ });
  };

  // update ingredients with new amount
  const onTextChanged = (e) => {
    const rowIndex = e.target.dataset.index;
    const updatedRows = [...rows];
    updatedRows[rowIndex].amount = e.target.value;
    setRows(updatedRows);
  }

  // remove ingredient from list
  const onDeleteButtonClicked = (e) => {
    let actualTarget = e.target;
    while (!actualTarget.dataset.index || actualTarget.id === 'root') {
      actualTarget = actualTarget.parentNode;
    }
    if (actualTarget.id === 'root') {
      return;
    }
    const rowIndex = parseInt(actualTarget.dataset.index);
    const updatedRows = rows.filter((_, index) => index !== rowIndex);
    setRows(updatedRows);
  }

  return <section>
      <div>
        <Table>
          <TableBody>
              {rows.map((row, index) => {
                return <TableRow key={row.key}>
                  <TableCell>
                      <TextInput 
                        value={row.amount}
                        placeholder="Amount"
                        data-index={index}
                        onChange={onTextChanged}>
                      </TextInput>
                  </TableCell>
                  <TableCell style={{ width: '200px' }}>
                    {row.name ? row.name :
                      <SkeletonContainer svgHeight="20">
                        <SkeletonBodyText numberOfLines="1"></SkeletonBodyText>
                      </SkeletonContainer>
                    }
                  </TableCell>
                  <TableCell>
                      <EditorToolbarButton 
                        icon="Delete"
                        data-index={index}
                        onClick={onDeleteButtonClicked}>
                      </EditorToolbarButton>
                  </TableCell>
                </TableRow>;
              })}
          </TableBody>
        </Table>
      </div>
      <div style={{marginTop: '10px', marginBottom: '10px'}}>
        <Button 
          icon="Plus"
          buttonType="naked"
          onClick={onAddButtonClicked}>
            Add
        </Button>
      </div>
    </section>;
};

export default RepeatableReferenceField;
