var express = require("express");
var cors = require('cors')

const app = express();


app.use(express.json());
app.use(cors())
app.locals.index = 1567829555;


let googleContainer = require('@google-cloud/container');
let k8s = require('@kubernetes/client-node');

// Create the Cluster Manager Client
let client = new googleContainer.v1.ClusterManagerClient();


let projectID = ""
let k8s_client = null
let k8sClientConfig = null


const frontEndContainer = {
  name: 'storybored-frontend',
  image: 'gcr.io/storybored-364419/storybored-frontend:0.6',
  ports: [{
    containerPort: 3000,
    hostPort: 3000
  }]
}
const backEndContainer = {
  name: 'storybored-backend',
  image: 'gcr.io/storybored-364419/storybored-backend:0.5',
  ports: [{
    containerPort: 7007,
    hostPort: 7007
  }]
}
const redisContainer = {
  name: 'redis',
  image: 'redis:alpine',
  ports: [{
    containerPort: 6379,
    hostPort: 6379
  }]
}

const createService = async (k8s_client, service, roomID) => {
  k8s_client.createNamespacedService('default', service).then(
    (res) => { console.log("service made") },
    (err) => { console.log(err) }
  );

  // k8s_client.listNamespacedService('default').then(
  //   (res) => { printServices(res.body.items); },
  //   (err) => { console.log('Error!: ' + err); },
  // );
  console.log('create service', service);
}


const createPod = async (k8s_client, pod) => {

  k8s_client.createNamespacedPod('default', pod).then(
    (res) => { console.log("pod made") },
    (err) => { console.log(err) }
  );
  console.log('create pod', pod);

};

const createIngress = async (k8s_client, pod) => {

  k8s_client.createNamespacedCustomObject('networking.k8s.io', 'v1', 'default', 'ingresses', pod).catch((e) => console.error(e)).then(
    // (res) => { console.log(res) },
    (err) => { console.log(err) }
  );
  console.log('create pod', pod);

};



const filterServices = (services) => {
  // https://github.com/kubernetes-client/csharp/issues/176
  services.forEach(svc => {
    if (svc.status.loadBalancer.ingress) {
      svc.status.loadBalancer.ingress.forEach(item => {
        if (item.ip) {
          console.log("ITEM", item.ip)
          return item.ip
        }
      })
    }
  });
  return null
}

const findExternalIp = async (k8s_client, roomID) => {
  const labelS = `roomID=${roomID}`
  console.log("LABEL:", labelS)
  k8s_client.listNamespacedService(
    'default',
    undefined,
    undefined,
    undefined,
    undefined,
    labelSelector = labelS
  ).then(
    (res) => {
      return filterServices(res.body.items)
    },
    (err) => {
      console.log('Error!: ' + err);
    },
  );
}



/**
 * The following function is equivalent to the 'get-credentials' call using
 * gcloud. The client assumes that the 'GOOGLE_APPLICATION_CREDENTIALS'
 * environment variable is set to the json key file associated to your GCP
 * service account (https://cloud.google.com/docs/authentication/production#create_service_account).
 *
 * The return values of this method are the credentials that are used to update
 * the k8s config file (~/.kube/config) to add a new context when
 * 'get-credentials' is invoked by the 'gcloud' CLI
 */
async function getCredentials(cluster, zone) {
  const projectId = await client.getProjectId();
  const accessToken = await client.auth.getAccessToken();
  projectID = projectId
  const request = {
    projectId: projectId,
    zone: zone,
    clusterId: cluster
  };

  const [response] = await client.getCluster(request);
  // the following are the parameters added when a new k8s context is created
  return {
    // the endpoint set as 'cluster.server'
    endpoint: response.endpoint,
    // the certificate set as 'cluster.certificate-authority-data'
    certificateAuthority: response.masterAuth.clusterCaCertificate,
    // the accessToken set as 'user.auth-provider.config.access-token'
    accessToken: accessToken
  }
}

async function main(cluster, zone) {
  const k8sCredentials = await getCredentials(cluster, zone);
  k8sClientConfig = new k8s.KubeConfig();
  // const k8s_api = new k8s.CoreV1Api('https://' + k8sCredentials.endpoint);
  // k8s_client = kc.makeApiClient(k8s_api);
  k8sClientConfig.loadFromOptions({
    clusters: [{
      name: `my-gke-cluster_${cluster}`,            // any name can be used here
      caData: k8sCredentials.certificateAuthority,  // <-- this is from getCredentials call
      server: `https://${k8sCredentials.endpoint}`, // <-- this is from getCredentials call
    }],
    users: [{
      name: `my-gke-cluster_${cluster}`,
      authProvider: 'gcp',                          // the is not a required field
      token: k8sCredentials.accessToken             // <-- this is from getCredentials call
    }],
    contexts: [{
      name: `my-gke-cluster_${cluster}`,
      user: `my-gke-cluster_${cluster}`,
      cluster: `my-gke-cluster_${cluster}`
    }],
    currentContext: `my-gke-cluster_${cluster}`,
  });

  k8s_client = await k8sClientConfig.makeApiClient(k8s.CoreV1Api);


  // k8s_client = new k8s.CoreV1Api('https://' + k8sCredentials.endpoint);
  // k8s_clientCustom = new k8s.CustomObjectsApi('https://' + k8sCredentials.endpoint);




  // k8s_client.setDefaultAuthentication({
  //   applyToRequest: (opts) => {
  //     opts.ca = Buffer.from(k8sCredentials.certificateAuthority, 'base64');
  //     opts.headers.Authorization = 'Bearer ' + k8sCredentials.accessToken;
  //   },
  // });

  // k8s_clientCustom.setDefaultAuthentication({
  //   applyToRequest: (opts) => {
  //     opts.ca = Buffer.from(k8sCredentials.certificateAuthority, 'base64');
  //     opts.headers.Authorization = 'Bearer ' + k8sCredentials.accessToken;
  //   },
  // });


  // const podBack = {
  //   kind: 'Pod',
  //   metadata: {
  //     name: "backend-pod",
  //     labels: {
  //       app: 'storybored-backend-pod',
  //     },
  //   },
  //   spec: {
  //     containers: [backEndContainer, redisContainer],
  //   },
  // }


  // // let name = `storybored-ds-${roomID}`
  // const serviceBack = {
  //   kind: 'Service',
  //   metadata: {
  //     name: "backend-service",
  //     labels: {
  //       app: 'storybored-backend-service',
  //     },
  //   },
  //   spec: {
  //     selector: { app: 'storybored-backend-pod' },
  //     ports: [{ port: 7007 }],
  //     type: 'LoadBalancer'
  //   },
  // }


  // createPod(k8s_client, podBack)
  // createService(k8s_client, serviceBack)

}



const watchServices = (servicename) => {
  const watch = new k8s.Watch(k8sClientConfig);
  watch.watch(`/api/v1/namespaces/default/services`,
    // optional query parameters can go here.
    {
      allowWatchBookmarks: true,
    },
    // callback is called for each received object.
    (type, apiObj, watchObj) => {
      if (type === 'ADDED') {
        // tslint:disable-next-line:no-console
        console.log('new object:');
      } else if (type === 'MODIFIED') {
        // tslint:disable-next-line:no-console
        console.log('changed object:', apiObj, watchObj);
      } else if (type === 'DELETED') {
        // tslint:disable-next-line:no-console
        console.log('deleted object:');
      } else if (type === 'BOOKMARK') {
        // tslint:disable-next-line:no-console
        console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
      } else {
        // tslint:disable-next-line:no-console
        console.log('unknown type: ' + type);
      }
      // tslint:disable-next-line:no-console

    },
    // done callback is called if the watch terminates normally
    (err) => {
      // tslint:disable-next-line:no-console
      console.log("done callback?", err);
    })
    .then((req) => {
      // watch returns a request object which you can use to abort the watch.
      setTimeout(() => { req.abort(); }, 10 * 1000);
    });
}

async function createRoom(roomID) {
  let name = `storybored.ds.${roomID}`
  let servicename = `storybored-${roomID}`
  let ingressname = `storybored-ingress-${roomID}`

  const appRoom = {
    kind: 'Pod',
    metadata: {
      name,
      labels: {
        app: 'storybored-room-pod',
        roomID: roomID
      },
    },
    spec: {
      containers: [frontEndContainer],
    },
  }

  const serviceRoom = {
    kind: 'Service',
    metadata: {
      name: servicename,
      labels: {
        app: 'storybored-room-service',
        roomID: roomID
      },
    },
    spec: {
      selector: { roomID: roomID },
      ports: [{ port: 3000 }],
      externalIPs: [],
      type: 'LoadBalancer'
    },
  }

  // const ingressRoom = {
  //   kind: 'Ingress',
  //   metadata: {
  //     name: ingressname,
  //     labels: {
  //       app: 'storybored-room-ingress',
  //     },
  //   },
  //   spec: {
  //     rules: [{
  //       host: "storybored.com",
  //       http: {
  //         paths: [{
  //           path: `/${roomID}`,
  //           pathType: "Prefix",
  //           backend: {
  //             service: {
  //               name: servicename,
  //               port: {
  //                 number: 3000
  //               }
  //             }
  //           }
  //         }]
  //       }
  //     }]
  //   },
  // }
  const ingressRoom = {

    kind: 'Ingress',
    metadata: {
      name: ingressname,
      labels: {
        app: 'storybored-room-ingress',
      },
    },
    spec: {
      rules: [{
        http: {
          paths: [{
            path: `/${roomID}`,
            pathType: "Prefix",
            backend: {
              service: {
                name: servicename,
                port: {
                  number: 3000
                }
              }
            }
          }]
        }
      }]
    },
  }

  await createPod(k8s_client, appRoom)
  await createService(k8s_client, serviceRoom, roomID)
  // await createIngress(k8s_clientCustom, ingressRoom)

  watchServices(servicename)

  // let ipAddress = null
  // while (!ipAddress) {
  //   ipAddress = await findExternalIp(k8s_client, roomID)
  //   setTimeout(() => {
  //     console.log("Delayed for 5 second.");
  //   }, 5000)
  // }






}


async function createRoom2(roomID) {

  let name = `storybored.ds.${roomID}`
  let servicename = `storybored-${roomID}`
  let ingressname = `storybored-ingress-${roomID}`

  const appRoom = {
    kind: 'Pod',
    metadata: {
      name,
      labels: {
        app: 'storybored-room-pod',
        roomID: roomID
      },
    },
    spec: {
      containers: [frontEndContainer],
    },
  }

  const serviceRoom = {
    kind: 'Service',
    metadata: {
      name: servicename,
      labels: {
        app: 'storybored-room-service',
        roomID: roomID
      },
    },
    spec: {
      selector: { roomID: roomID },
      ports: [{ port: 3000 }],
      type: 'LoadBalancer'
    },
  }


  await createPod(k8s_client, appRoom)
  await createService(k8s_client, serviceRoom, roomID)

}

app.get("/api/pod", (req, res) => {
  let roomID = (app.locals.index++).toString(36);
  let roomType = req.params.roomType === "true" ? "private" : "public"
  console.log(roomID, roomType)
  createRoom(roomID)


});


app.get("/api/test", (req, res) => {
  let id = (app.locals.index++).toString(36);
  res.json({ hello: "there" })
});

app.get("/api/services", (req, res) => {
  k8s_client.listNamespacedService(
    'default'
  )
    .then(
      (res) => { printServices(res.body.items); },

      (err) => { console.log('Error!: ' + err); },
    );

})


main('storybored-cluster', 'us-east1-b').catch(console.error);

const PORT = process.env.PORT || 4001
app.listen(PORT, () => {
  console.log(`started server on port ${PORT}`);
});


