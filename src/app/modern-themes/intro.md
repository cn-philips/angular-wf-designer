# UI 
## Code Structure
  - /modern-themes/components
  - /modern-themes/directive
  - /modern-themes/style
 
## Components

  * ### Label Popup
  > Label-popip should be wrapped in nz-form-label as inset popup icon.
  ```html
  <nz-form-label nzXs="24" nzSm="24" nzMd="6" nzRequired>
    <Label-popup [width]="'200px'">
      <!--Label-->
      <ng-template labelPopupContent>
        <!--CONTENT-->
      </ng-template>
    </Label-popup>
  </nz-form-label>
  ```
  * ### Pagination Button
  ```html
    <app-pagination-button
      (click)="carousel.pre()"
      direction="previous"
    />
    <app-pagination-button
      (click)="carousel.next()"
      direction="next"
    />
  
  ```
  
  * ### Tab
  ```html
  
  ```
  * ### Approval Progress
  ```html
    <app-approval-progress></app-approval-progress>
  ```
  * ### Progress Tab 
  ```html
  <app-progress-tabs
    (tabChange)="tabChange($event)"
    [activeId]="activedId"
    #tabs>
    <app-progress-tab id="pending-tab"><!--Unique Tab ID-->
      <ng-template pTabTitle> 
        <!-- Title -->
      </ng-template>
      <ng-template pTabContent> 
        <!-- Tab Content -->
      </ng-template>
    </app-progress-tab> 

    <app-progress-tab id="...">
      ...
    </app-progress-tab>

  </app-progress-tabs>
  ```
  ```js
    this.tabs.error(tabId)
    this.tabs.clearError(tabId)
    this.tabs.hasError(tabId)
  ```
  
  * ### Dialog Panel
    ```html
    <app-dialog-panel [title]="'system-support-dropdown.qa' | translate" #qa>
      <app-dialog-panel-tab
        [title]="'system-support-dropdown.qa-documents' | translate"
      > 
      <!-- CONTENT --> 
      </app-dialog-panel-tab>
    </app-dialog-panel>
    ```
    ```js
      this.qa.showModal(index?)
      this.qa.hideModal()
    ```
  * ### Form Section
    ```html
    
    ```

## Form Standard
  1. Horizontal layout, No colon.
  ```html
  <form
    nz-form
    [formGroup]="validateForm"
    [nzLayout]="'horizontal'"
    [nzNoColon]="true"
  >
  ```
  1. Separated Validation for multiple forms.
  2. Simplify layer of form items.
  3. Following Ng-Zorro grid standard.


## Common Style 
  ```css
  /* Hover to expand side border */
  .p-border-list-item
  ```
## UI Mode Switch

## I18N
  ### Ngx-Translate
  [Git Repo](https://github.com/ngx-translate/core/tree/v11.0.1)
  ### Usage 
  1. Import Translate Module
  ```js
    
    import { TranslateModule } from "@ngx-translate/core";
    @NgModule({ 
      import:[ 
        TranslateModule 
      ]
    })
    export class UsingModule{}
  ```
  2. Use in template
  ```html
  <div>
  {{ 'key-mapping' | translate }}
  </div>
  ```
  ```html
  <div [translate]="key-mapping"></div>
  ```
  ### Locals
  - Path: /src/assets/i18n/*.json
