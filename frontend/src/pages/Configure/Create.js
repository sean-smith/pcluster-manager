// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import * as React from 'react';
import { CreateCluster, UpdateCluster, ListClusters, DescribeCluster, notify } from '../../model'

// UI Elements
import {
  Header,
  Spinner,
} from "@awsui/components-react";

// Components
import ValidationErrors from '../../components/ValidationErrors'

// State
import { setState, getState, useState } from '../../store'

// Constants
const configPath = ['app', 'wizard', 'clusterConfigYaml'];

function handleWarnings(resp) {
  if(!resp.validatonMessages)
    return;

  resp.validatonMessages.forEach((message, i) => {
      notify(message.message, 'warning');
  })
}

function handleCreate(handleClose) {
  const clusterName = getState(['app', 'wizard', 'clusterName']);
  const editing = getState(['app', 'wizard', 'editing']);
  const clusterConfig = getState(configPath);
  const dryRun = false;
  const region = getState(['app', 'wizard', 'config', 'Region']);
  var errHandler = (err) => {setState(['app', 'wizard', 'errors', 'create'], err); setState(['app', 'wizard','pending'], false);}
  var successHandler = (resp) => {
    handleWarnings(resp);
    setState(['app', 'wizard', 'pending'], false);
    DescribeCluster(clusterName)
    setState(['app', 'clusters', 'selected'], clusterName);
    ListClusters();
    handleClose()
  }
  setState(['app', 'wizard', 'errors', "create"], null);

  if(editing)
  {
    setState(['app', 'wizard', 'pending'], "Update");
    UpdateCluster(clusterName, clusterConfig, dryRun, successHandler, errHandler);
  }
  else
  {
    setState(['app', 'wizard', 'pending'], "Create");
    CreateCluster(clusterName, clusterConfig, region, dryRun, successHandler, errHandler);
  }
}

function handleDryRun(handleClose) {
  const clusterName = getState(['app', 'wizard', 'clusterName']);
  const editing = getState(['app', 'wizard', 'editing']);
  const clusterConfig = getState(configPath);
  const region = getState(['app', 'wizard', 'config', 'Region']);
  const dryRun = true;
  var errHandler = (err) => {setState(['app', 'wizard', 'errors', 'create'], err); setState(['app', 'wizard','pending'], false);}
  var successHandler = (resp) => {
    handleWarnings(resp);
    setState(['app', 'wizard', 'pending'], false);
  }
  setState(['app', 'wizard', 'pending'], "Dry Run");
  setState(['app', 'wizard', 'errors', "create"], null);
  if(editing)
    UpdateCluster(clusterName, clusterConfig, dryRun, successHandler, errHandler);
  else
    CreateCluster(clusterName, clusterConfig, region, dryRun, successHandler, errHandler);
}

function createValidate() {
  return true;
}

function Create() {
  const clusterConfig = useState(configPath);
  const errors = useState(['app', 'wizard', 'errors', 'create']);
  const pending = useState(['app', 'wizard', 'pending']);
  const editing = getState(['app', 'wizard', 'editing']);
  return (
    <>
      <Header description={`This is the cluster configuration that will be used to ${editing ? 'update' : 'create'} your cluster.`}
      ></Header>
      <textarea
        disabled={ pending ? true : false}
        spellCheck="false"
        className="configuration-data" value={clusterConfig}
        onChange={(e) => {setState(configPath, e.target.value)}} />
      {errors && <ValidationErrors errors={errors} /> }
      {pending && <div><Spinner size="normal" /> {pending} request pending...</div>}
    </>
  );
}

export { Create, createValidate, handleCreate, handleDryRun }
