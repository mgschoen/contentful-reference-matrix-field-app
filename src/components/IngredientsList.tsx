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

const IngredientsList = (props: FieldProps) => {
  const fieldValue = props.sdk.field.getValue();
  const [ingredients, setIngredients] = useState(fieldValue || []);

  // use contentful's builtin auto-resizer 
  useEffect(() => {
    props.sdk.window.startAutoResizer();
  })

  // check for unresolved names and fetch them from contenful if neccessary
  useEffect(() => {
    const ingredientsWithoutName = ingredients.filter((ingredient) => !ingredient.name);
    if (!ingredientsWithoutName.length) {
      return;
    }

    const ids = ingredients.map((ingredient) => ingredient.id);
    props.sdk.space.getEntries({ 'sys.id[in]': ids }).then((queryResult) => {
      let populatedIngredients = ingredients.map((ingredient) => {
        const resultForCurrentIngredient = queryResult.items.filter((entry) => entry.sys.id === ingredient.id).pop();
        return {
          name: resultForCurrentIngredient ? resultForCurrentIngredient.fields.title['en-US'] : '',
          ...ingredient
        }
      });
      setIngredients(populatedIngredients);
    });
  }, [ingredients]);

  // update contentful field value whenever ingredients data changes
  useEffect(() => {
    const sanitizedIngredients = ingredients.map((ingredient) => {
      return { amount: ingredient.amount, id: ingredient.id };
    });
    props.sdk.field.setValue(sanitizedIngredients);
  }, [ingredients]);

  // open entry selection dialog and append selected entries to the end of our list
  const onAddButtonClicked = () => {
    props.sdk.dialogs.selectMultipleEntries({contentTypes: ['ingredient']})
      .then((selectedIngredients) => {
        setIngredients([
          ...ingredients,
          ...selectedIngredients.map((ingredient) => { 
            return { amount: '', id: ingredient.sys.id }
          })
        ]);
        props.sdk.field.setValue(ingredients);
      })
      .catch(() => { /* do nothing */ });
  };

  // update ingredients with new amount
  const onAmountChanged = (e) => {
    const ingredientIndex = e.target.dataset.index;
    const updatedIngredients = [...ingredients];
    updatedIngredients[ingredientIndex].amount = e.target.value;
    setIngredients(updatedIngredients);
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
    const ingredientIndex = parseInt(actualTarget.dataset.index);
    const updatedIngredients = ingredients.filter((_, index) => index !== ingredientIndex);
    setIngredients(updatedIngredients);
  }

  return <section>
      <div>
        <Table>
          <TableBody>
              {ingredients.map((ingredient, index) => {
                return <TableRow key={ingredient.id}>
                  <TableCell>
                      <TextInput 
                        value={ingredient.amount}
                        placeholder="Amount"
                        data-index={index}
                        onChange={onAmountChanged}>
                      </TextInput>
                  </TableCell>
                  <TableCell style={{ width: '200px' }}>
                    {ingredient.name ? ingredient.name :
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

export default IngredientsList;
