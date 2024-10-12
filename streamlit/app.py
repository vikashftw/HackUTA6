import streamlit as st
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

MONGO_URI = "mongodb+srv://GxhNFKK2idTsQRdN:GxhNFKK2idTsQRdN@horizon.cbsjq.mongodb.net/?retryWrites=true&w=majority&appName=Horizon&tlsAllowInvalidCertificates=true"

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client.relief_db
providers_collection = db.providers

try:
    client.admin.command('ping')
    st.success("Successfully connected to MongoDB!")
except Exception as e:
    st.error(f"Error connecting to MongoDB: {e}")

def save_provider(name, contact, services, county):
    provider_data = {
        "name": name,
        "contact": contact,
        "services": services,
        "county": county
    }
    providers_collection.insert_one(provider_data)
    st.success(f"Relief provider '{name}' has been added to the database.")

def get_providers():
    return list(providers_collection.find())

st.title("Horizon: Relief Provider Management and Data Acquisition")

with st.form(key='provider_form'):
    name = st.text_input("Provider Name")
    contact = st.text_input("Contact Information")
    services = st.text_area("Services Provided")
    county = st.text_input("County")
    
    submit_button = st.form_submit_button(label='Add Provider')

if submit_button:
    if name and contact and services and county:
        save_provider(name, contact, services, county)
    else:
        st.error("Please fill out all fields.")

st.subheader("All Relief Providers")
providers = get_providers()
if providers:
    for provider in providers:
        st.write(f"**Name:** {provider['name']}")
        st.write(f"**Contact:** {provider['contact']}")
        st.write(f"**Services:** {provider['services']}")
        st.write(f"**County:** {provider['county']}")
        st.write("---")
else:
    st.write("No relief providers found.")