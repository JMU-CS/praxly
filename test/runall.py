"""Unit tests for Praxly.

This script uses Selenium to drive the web browser.
https://www.selenium.dev/documentation/webdriver/
"""

import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

# URL to test (localhost or production)
URL = "https://praxly.github.io/"

# Timeout, in seconds, to find DOM elements.
WAIT = 10

# How long to sleep before performing actions.
PAUSE = 0.5


def main():
    """Run each test in a loop until one fails."""

    print("Opening browser window")
    driver = webdriver.Firefox()
    driver.implicitly_wait(WAIT)
    driver.get(URL)

    print("Finding DOM elements")
    refresh = driver.find_element(By.ID, "titleRefresh")
    editor = driver.find_element(By.ID, "aceCode")
    play = driver.find_element(By.ID, "runButton")
    stdout = driver.find_element(By.CLASS_NAME, "stdout")
    # TODO stderr = driver.find_element(By.CLASS_NAME, "stderr")

    # for each test in the CSV file
    file = open('tests.csv', newline='')
    file.readline()  # skip header
    test_id = 0
    for row in csv.reader(file):
        test_id += 1
        name, code, expect_out, expect_err = row

        print(f"Test {test_id}: {name}...", end="", flush=True)
        time.sleep(PAUSE)
        refresh.click()
        driver.execute_script(f'ace.edit("aceCode").setValue(`{code}`);')
        editor.click()
        play.click()

        actual_out = stdout.get_attribute("textContent")
        # TODO actual_err = stderr.get_attribute("textContent")
        if actual_out == expect_out:  # TODO and actual_err == expect_err:
            print("PASS")
        else:
            print("FAIL")
            print(f"  Expect out: {expect_out}")
            print(f"  Expect err: {expect_err}")
            print(f"  Actual out: {actual_out}")
            # TODO print(f"  Actual err: {actual_err}")
            break

    input("Press Enter to quit...")


if __name__ == "__main__":
    main()
