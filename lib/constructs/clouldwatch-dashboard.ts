// CloudWorkDashBoard Construct
import { Construct, } from 'constructs';
import { StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as rds from 'aws-cdk-lib/aws-rds';

export interface CloudWatchDashboardProps extends StackProps {
    readonly projectName: string;
    readonly dbCluster: rds.DatabaseCluster;
}

export class CloudWatchDashboard extends Construct {
    constructor(scope: Construct, id: string, props: CloudWatchDashboardProps) {
        super(scope, id);
        const projectName = props.projectName;
        const dbCluster = props.dbCluster;

        const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
            dashboardName: projectName + '-dashboard'
        });

        let dbConnections = dbCluster.metricDatabaseConnections();
        let cpuUtilization = dbCluster.metricCPUUtilization();
        let deadlocks = dbCluster.metricDeadlocks();
        let freeLocalStorage = dbCluster.metricFreeLocalStorage();
        let freeableMemory = dbCluster.metricFreeableMemory();
        let networkRecieveThroughput = dbCluster.metricNetworkReceiveThroughput();
        let networkThroughput = dbCluster.metricNetworkThroughput();
        let networkTransmitThroughput = dbCluster.metricNetworkTransmitThroughput();
        let snapshotStorageUsed = dbCluster.metricSnapshotStorageUsed();
        let totalBackupStorageBilled = dbCluster.metricTotalBackupStorageBilled();
        let volumeBytesUsed = dbCluster.metricVolumeBytesUsed();
        let volumeReadIoPs = dbCluster.metricVolumeReadIOPs();
        let volumeWriteIoPs = dbCluster.metricVolumeWriteIOPs();

        //  The average amount of time taken per disk I/O operation (average over 1 minute)
        const readLatency = dbCluster.metric('ReadLatency', {
            statistic: 'Average',
        });

        const widgetDbConnections = new cloudwatch.GraphWidget({
            title: 'DB Connections',
            // Metrics to display on left Y axis.
            left: [dbConnections],
        });

        // Create a CloudWatch alarm to alert when CPU utilization exceeds 90%
        const cpuUtilizationAlarm = new cloudwatch.Alarm(this, 'MyCpuUtilizationAlarm', {
            metric: cpuUtilization,
            threshold: 90,
            evaluationPeriods: 3,
            alarmDescription: 'Alarm when CPU exceeds 90%',

        });

        const widgetCpuUtilizaton = new cloudwatch.GraphWidget({
            title: 'CPU Utilization',
            // Metrics to display on left Y axis
            left: [cpuUtilization],
        });

        const widgetReadLatency = new cloudwatch.GraphWidget({
            title: 'Read Latency',
            //  Metrics to display on left Y axis.
            left: [readLatency],
        });

        freeLocalStorage = dbCluster.metricFreeLocalStorage();
        freeableMemory = dbCluster.metricFreeableMemory();
        networkRecieveThroughput = dbCluster.metricNetworkReceiveThroughput();
        networkThroughput = dbCluster.metricNetworkThroughput();
        networkTransmitThroughput = dbCluster.metricNetworkTransmitThroughput();
        snapshotStorageUsed = dbCluster.metricSnapshotStorageUsed();
        totalBackupStorageBilled = dbCluster.metricTotalBackupStorageBilled();
        volumeBytesUsed = dbCluster.metricVolumeBytesUsed();
        volumeReadIoPs = dbCluster.metricVolumeReadIOPs();
        volumeWriteIoPs = dbCluster.metricVolumeWriteIOPs();

        const widgetDeadlocks = new cloudwatch.GraphWidget({
            title: 'Deadlocks',
            left: [deadlocks],
        });

        const widgetFreeLocalStorage = new cloudwatch.GraphWidget({
            title: 'Free Local Storage',
            left: [freeLocalStorage],
        });

        const widgetFreeableMemory = new cloudwatch.GraphWidget({
            title: 'Freeable Memory',
            left: [freeableMemory],
        });

        const widget_network_receive_throughput = new cloudwatch.GraphWidget({
            title: 'Network Throuput',
            left: [networkRecieveThroughput, networkThroughput, networkTransmitThroughput],

        });

        const widgetTotalBackupStorageBilled = new cloudwatch.GraphWidget({
            title: 'Backup Storage Billed',
            left: [totalBackupStorageBilled],
        });

        const widgetVolumeBytes = new cloudwatch.GraphWidget({
            title: 'Storage',
            left: [volumeBytesUsed, snapshotStorageUsed],
        });

        const widgetVolumeIops = new cloudwatch.GraphWidget({
            title: 'Volume IOPs',
            left: [volumeReadIoPs, volumeWriteIoPs],
        });


        dashboard.addWidgets(
            widgetDbConnections,
            widgetCpuUtilizaton
        );
        dashboard.addWidgets(
            widgetTotalBackupStorageBilled,
            widgetFreeLocalStorage
        );
        dashboard.addWidgets(
            widgetFreeableMemory,
            widgetVolumeBytes,
            widgetVolumeIops,
        );
        dashboard.addWidgets(
            widget_network_receive_throughput,
            widgetReadLatency,
            widgetDeadlocks,
        );



    }
}

export default CloudWatchDashboard;