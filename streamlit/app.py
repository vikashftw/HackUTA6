import streamlit as st
import requests
import time
from datetime import datetime

# Replace this with your Express server's URL
API_BASE_URL = "http://localhost:3000/api/clients"  # Adjust if your server is on a different port or host

st.title("Horizon: Relief Provider and Client Management")

# Function to get active alerts from the Express API
def get_active_alerts():
    response = requests.get(f"{API_BASE_URL}/active-alerts")
    if response.status_code == 200:
        return response.json()
    else:
        st.error("Failed to fetch active alerts")
        return []

# Function to send a new alert
def send_alert(client_id, location, emergency_type, description):
    response = requests.post(f"{API_BASE_URL}/alert", json={
        "clientId": client_id,
        "location": location,
        "emergencyType": emergency_type,
        "description": description
    })
    return response.status_code == 200

# Function to resolve an alert
def resolve_alert(client_id, alert_id):
    response = requests.post(f"{API_BASE_URL}/resolve-alert", json={
        "clientId": client_id,
        "alertId": alert_id
    })
    return response.status_code == 200

tab1, tab2, tab3 = st.tabs(["Clients", "Send Alert", "Active Alerts"])

with tab1:
    st.header("Nearby Clients")
    latitude = st.number_input("Latitude", value=0.0)
    longitude = st.number_input("Longitude", value=0.0)
    max_distance = st.number_input("Max Distance (meters)", value=10000)
    if st.button("Find Nearby Clients"):
        response = requests.get(f"{API_BASE_URL}/nearby", params={
            "latitude": latitude,
            "longitude": longitude,
            "maxDistance": max_distance
        })
        if response.status_code == 200:
            clients = response.json()
            for client in clients:
                st.write(f"**Name:** {client['name']}")
                st.write(f"**Location:** {client['location']['coordinates']}")
                st.write(f"**Capacity:** {client['capacity']}")
                st.write(f"**Specialties:** {', '.join(client['specialties'])}")
                st.write("---")
        else:
            st.error("Failed to fetch nearby clients")

with tab2:
    st.header("Send Alert")
    client_id = st.text_input("Client ID")
    emergency_type = st.text_input("Emergency Type")
    description = st.text_area("Description")
    lat = st.number_input("Latitude", key="alert_lat")
    lon = st.number_input("Longitude", key="alert_lon")
    if st.button("Send Alert"):
        if send_alert(client_id, {"latitude": lat, "longitude": lon}, emergency_type, description):
            st.success("Alert sent successfully")
        else:
            st.error("Failed to send alert")

with tab3:
    st.header("Active Alerts")
    
    alerts_placeholder = st.empty()
    
    def display_alerts():
        active_alerts = get_active_alerts()
        with alerts_placeholder.container():
            if active_alerts:
                for client in active_alerts:
                    st.subheader(f"Client: {client['name']}")
                    for alert in client['activeAlerts']:
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.write(f"**Emergency Type:** {alert.get('emergencyType', 'N/A')}")
                            st.write(f"**Description:** {alert.get('description', 'N/A')}")
                            st.write(f"**Location:** {alert.get('location', {}).get('coordinates', 'N/A')}")
                            st.write(f"**Timestamp:** {alert.get('timestamp', 'N/A')}")
                        with col2:
                            if st.button("Resolve", key=f"resolve_{client['_id']}_{alert['_id']}"):
                                if resolve_alert(client['_id'], alert['_id']):
                                    st.success("Alert resolved successfully!")
                                else:
                                    st.error("Failed to resolve alert.")
                        st.write("---")
            else:
                st.write("No active alerts found.")

    display_alerts()

    if st.button("Refresh Alerts"):
        display_alerts()



    refresh_interval = 5  # seconds
    refresh_counter = st.empty()

    while True:
        display_alerts()
        for remaining in range(refresh_interval, 0, -1):
            refresh_counter.text(f"Refreshing in {remaining} seconds...")
            time.sleep(1)
        refresh_counter.empty()
        st.rerun()