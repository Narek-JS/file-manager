import "../node_modules/@syncfusion/ej2-base/styles/material.css";
import "../node_modules/@syncfusion/ej2-icons/styles/material.css";
import "../node_modules/@syncfusion/ej2-inputs/styles/material.css";
import "../node_modules/@syncfusion/ej2-popups/styles/material.css";
import "../node_modules/@syncfusion/ej2-buttons/styles/material.css";
import "../node_modules/@syncfusion/ej2-splitbuttons/styles/material.css";
import "../node_modules/@syncfusion/ej2-navigations/styles/material.css";
import "../node_modules/@syncfusion/ej2-layouts/styles/material.css";
import "../node_modules/@syncfusion/ej2-grids/styles/material.css";
import "../node_modules/@syncfusion/ej2-react-filemanager/styles/material.css";

import * as React from "react";
import {
  FileManagerComponent,
  Inject,
  NavigationPane,
  DetailsView,
  Toolbar,
} from "@syncfusion/ej2-react-filemanager";
import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCe0x+WmFZfVtgcF9EY1ZRRmYuP1ZhSXxWdkFjUX9acndVQGBcUkd9XUs="
);

const Overview = () => {
  const hostUrl = "https://ej2-aspcore-service.azurewebsites.net/";

  return (
    <div>
      <div className="control-section">
        <FileManagerComponent
          id="overview_file"
          ajaxSettings={{
            url: hostUrl + "api/FileManager/FileOperations",
            getImageUrl: hostUrl + "api/FileManager/GetImage",
            uploadUrl: hostUrl + "api/FileManager/Upload",
            downloadUrl: hostUrl + "api/FileManager/Download",
          }}
          toolbarSettings={{
            items: [
              "NewFolder",
              "SortBy",
              "Cut",
              "Copy",
              "Paste",
              "Delete",
              "Refresh",
              "Download",
              "Rename",
              "Selection",
              "View",
              "Details",
            ],
          }}
          contextMenuSettings={{
            file: [
              "Cut",
              "Copy",
              "|",
              "Delete",
              "Download",
              "Rename",
              "|",
              "Details",
            ],
            layout: [
              "SortBy",
              "View",
              "Refresh",
              "|",
              "Paste",
              "|",
              "NewFolder",
              "|",
              "Details",
              "|",
              "SelectAll",
            ],
            visible: true,
          }}
          view={"Details"}
        >
          <Inject services={[NavigationPane, DetailsView, Toolbar]} />
        </FileManagerComponent>
      </div>
    </div>
  );
};

export default Overview;
