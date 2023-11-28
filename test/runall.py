"""Unit tests for Praxly.

This script uses Selenium to drive the web browser.
https://www.selenium.dev/documentation/webdriver/
"""

import colorama
import csv
import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.common.by import By

# URL to test (localhost or production)
URL = "http://localhost:5173/"  # https://praxly.github.io/

# Timeout, in seconds, to find DOM elements.
WAIT = 3

# How long to sleep before performing actions.
PAUSE = 0.25


def main(filename):
    """Run each test in a loop until one fails."""

    # set up terminal color support
    colorama.init(autoreset=True)
    pass_msg = colorama.Fore.GREEN + "PASS"
    fail_msg = colorama.Fore.RED + "FAIL"

    print("Opening browser window")
    driver = webdriver.Firefox()
    driver.implicitly_wait(WAIT)
    driver.get(URL)

    print("Finding DOM elements")
    refresh = driver.find_element(By.ID, "titleRefresh")
    editor = driver.find_element(By.ID, "aceCode")
    play = driver.find_element(By.ID, "runButton")
    stdout = driver.find_element(By.CLASS_NAME, "stdout")
    stderr = driver.find_element(By.CLASS_NAME, "stderr")

    # for each test in the CSV file
    print("Reading", filename)
    file = open(filename, encoding="utf-8", newline="")
    file.readline()  # skip header
    test_id = 0
    for row in csv.reader(file):
        test_id += 1
        name = row[0]
        code = row[1]
        expect_out = row[2].rstrip().replace("\r", "")
        expect_err = row[3].rstrip().replace("\r", "")

        print(f"Test {test_id}: {name}...", end="", flush=True)
        time.sleep(PAUSE)
        refresh.click()
        driver.execute_script(f'ace.edit("aceCode").setValue(`{code}`);')
        editor.click()
        play.click()

        # compare expected with actual output
        actual_out = stdout.get_attribute("innerText").rstrip()
        actual_err = stderr.get_attribute("innerText").rstrip()
        if actual_out == expect_out and actual_err == expect_err:
            print(pass_msg)
        else:
            print(fail_msg)
            if actual_out != expect_out:
                print(f"  Expect out: {expect_out}")
                print(f"  Actual out: {actual_out}")
            if actual_err != expect_err:
                print(f"  Expect err: {expect_err}")
                print(f"  Actual err: {actual_err}")

            yesno = input("Continue? [Y/n] ")
            if yesno not in ["", "y", "Y"]:
                break


if __name__ == "__main__":

    # optional command-line argument
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main("basic_tests.csv")

    # remove the log file if blank
    if os.path.exists("geckodriver.log"):
        if os.path.getsize("geckodriver.log") == 0:
            os.remove("geckodriver.log")
