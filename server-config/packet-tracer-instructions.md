# Cisco Packet Tracer Configuration for Helpdesk System

## Network Components

1. **3 Servers**:
   - Backend Server: 10.12.49.33/24
   - Frontend Server: 10.12.49.34/24
   - Database Server: 10.12.49.35/24

2. **Network Devices**:
   - 1 Router (Cisco 2811)
   - 1 Switch (Cisco 2960)
   - 1 Firewall (ASA 5505)
   - Internet Connection (Cloud)

3. **Client Computers**:
   - Admin Workstation: 10.12.49.100/24
   - Support Staff Workstations: 10.12.49.101-110/24
   - End User Workstations: 10.12.49.111-120/24

## Step-by-Step Setup

### 1. Create the Network Topology

1. Open Cisco Packet Tracer and create a new project.

2. Add devices from the bottom toolbar:
   - Add a Router (Cisco 2811) from the Network Devices section
   - Add a Switch (Cisco 2960) from the Network Devices section
   - Add a Firewall (ASA 5505) from the Network Devices section
   - Add a Cloud from the WAN Emulation section
   - Add 3 Servers from the End Devices section
   - Add several PCs from the End Devices section

3. Name your devices:
   - Backend-Server
   - Frontend-Server
   - Database-Server
   - Internal-Switch
   - Edge-Router
   - Firewall
   - Internet-Cloud

### 2. Connect the Devices

1. Use straight-through copper cables to connect:
   - All servers to the switch
   - All client PCs to the switch
   - Switch to the firewall (internal interface)

2. Connect the firewall external interface to the router using a straight-through cable.

3. Connect the router to the cloud using a serial cable.

### 3. Configure IP Addresses

#### Backend Server Configuration:
- IP Address: 10.12.49.33
- Subnet Mask: 255.255.255.0
- Default Gateway: 10.12.49.1

#### Frontend Server Configuration:
- IP Address: 10.12.49.34
- Subnet Mask: 255.255.255.0
- Default Gateway: 10.12.49.1

#### Database Server Configuration:
- IP Address: 10.12.49.35
- Subnet Mask: 255.255.255.0
- Default Gateway: 10.12.49.1

#### Switch Configuration:
- Management IP: 10.12.49.2
- Subnet Mask: 255.255.255.0
- Default Gateway: 10.12.49.1

#### Firewall Configuration:
- Inside Interface: 10.12.49.1/24
- Outside Interface: 203.0.113.2/30

#### Router Configuration:
- Inside Interface to Firewall: 203.0.113.1/30
- Outside Interface to Internet: DHCP or static IP (e.g., 198.51.100.2/30)

### 4. Configure Services

#### On the Backend Server:
- Enable HTTP service (port 5000)
- Configure services: Node.js application

#### On the Frontend Server:
- Enable HTTP service (port 80)
- Configure services: Static web hosting

#### On the Database Server:
- Enable MongoDB service (port 27017)
- Ensure it's only accessible from the backend server

### 5. Configure Security Rules

#### On the Firewall:
1. Create an access list to:
   - Allow HTTP/HTTPS traffic from internet to Frontend Server
   - Allow SSH from specific admin IPs to all servers
   - Block all direct access to the Database Server except from the Backend Server
   - Allow the Backend Server to communicate with both Frontend and Database servers

2. NAT/PAT configuration:
   - Set up NAT for outbound connections
   - Configure port forwarding for inbound connections to the Frontend Server

### 6. Test the Network

1. Send a ping from client computers to servers
2. Test HTTP connections from clients to the Frontend Server
3. Verify that the Backend Server can access the Database Server
4. Ensure clients cannot directly access the Database Server

### 7. Add Network Traffic Flow Indicators

1. Create PDUs (Protocol Data Units) to simulate:
   - Web requests from clients to Frontend
   - API calls from Frontend to Backend
   - Database queries from Backend to Database

### 8. Document the Network

1. Add a text box explaining the network architecture
2. Use different colors for different network segments
3. Include a legend explaining the IP addressing scheme
4. Add notes about security policies implemented

## Example Configuration Commands

### Router Configuration

```
Router> enable
Router# configure terminal
Router(config)# hostname Edge-Router
Edge-Router(config)# interface GigabitEthernet0/0
Edge-Router(config-if)# ip address 203.0.113.1 255.255.255.252
Edge-Router(config-if)# no shutdown
Edge-Router(config-if)# exit
Edge-Router(config)# ip route 0.0.0.0 0.0.0.0 [next-hop-ip]
```

### Firewall Configuration

```
firewall# configure terminal
firewall(config)# hostname Firewall
Firewall(config)# interface GigabitEthernet0/0
Firewall(config-if)# ip address 203.0.113.2 255.255.255.252
Firewall(config-if)# nameif outside
Firewall(config-if)# security-level 0
Firewall(config-if)# no shutdown
Firewall(config-if)# exit

Firewall(config)# interface GigabitEthernet0/1
Firewall(config-if)# ip address 10.12.49.1 255.255.255.0
Firewall(config-if)# nameif inside
Firewall(config-if)# security-level 100
Firewall(config-if)# no shutdown
```

### Access Control Lists

```
Firewall(config)# access-list OUTSIDE_IN extended permit tcp any host 10.12.49.34 eq www
Firewall(config)# access-list OUTSIDE_IN extended permit tcp any host 10.12.49.34 eq 443
Firewall(config)# access-list INSIDE_OUT extended permit ip any any
Firewall(config)# access-list DB_ACCESS extended permit tcp host 10.12.49.33 host 10.12.49.35 eq 27017
Firewall(config)# access-list DB_ACCESS extended deny ip any host 10.12.49.35

Firewall(config)# access-group OUTSIDE_IN in interface outside
Firewall(config)# access-group INSIDE_OUT out interface outside
Firewall(config)# access-group DB_ACCESS in interface inside
```

This completes your Cisco Packet Tracer network configuration for the Helpdesk System.
