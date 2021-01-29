import React from 'react';
import { render } from 'react-dom';

import {
  FieldExtensionSDK,
  BaseExtensionSDK,
  init,
  locations
} from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

import RepeatableReferenceField from './components/RepeatableReferenceField';

import LocalhostWarning from './components/LocalhostWarning';

if (process.env.NODE_ENV === 'development' && window.self === window.top) {
  // You can remove this if block before deploying your app
  const root = document.getElementById('root');
  render(<LocalhostWarning />, root);
} else {
  init((sdk: BaseExtensionSDK) => {
    const root = document.getElementById('root');

    // All possible locations for your app
    // Feel free to remove unused locations
    // Dont forget to delete the file too :)
    const ComponentLocationSettings = [
      {
        location: locations.LOCATION_ENTRY_FIELD,
        component: <RepeatableReferenceField sdk={(sdk as unknown) as FieldExtensionSDK} />
      },
    ];

    // Select a component depending on a location in which the app is rendered.
    ComponentLocationSettings.forEach(componentLocationSetting => {
      if (sdk.location.is(componentLocationSetting.location)) {
        render(componentLocationSetting.component, root);
      }
    });
  });
}
