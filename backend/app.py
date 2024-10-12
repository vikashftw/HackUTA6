import streamlit as st
import numpy as np
import pandas as pd

st.title("Horizon")

tabs = st.tabs(["I need", "I can help"])

with tabs[0]:
    st.header("Admin Panel")

with tabs[1]:
    st.header("Shelter Status")

number = st.slider("Distance:", 0, 200, 10)

if st.button("SOS"):
    st.write("Sending Help")