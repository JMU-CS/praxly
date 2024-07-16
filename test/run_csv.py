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
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException

# URL to test (localhost or production).
URL = "http://localhost:5173/"  # https://praxly.cs.jmu.edu/

# Timeout, in seconds, to find DOM elements.
WAIT = 3

# How long to sleep before performing actions.
PAUSE = 0.05


def main(csv_name, html_name):
    """Run each test in a loop until one fails."""
    print(f'main("{csv_name}", "{html_name}")')

    # set up terminal color support
    colorama.init(autoreset=True)
    pass_msg = colorama.Fore.GREEN + "PASS"
    fail_msg = colorama.Fore.RED + "FAIL"
    todo_msg = colorama.Fore.YELLOW + "TODO"

    print("Opening browser window")
    driver = webdriver.Firefox()
    driver.implicitly_wait(WAIT)
    driver.get(URL + html_name)

    # close Example Programs modal
    if html_name == "main.html":
        driver.find_element(By.CLASS_NAME, "close").click()

    print("Finding DOM elements")
    editor = driver.find_element(By.ID, "aceCode")
    play = driver.find_element(By.ID, "runButton")
    stdout = driver.find_element(By.CLASS_NAME, "stdout")
    stderr = driver.find_element(By.CLASS_NAME, "stderr")
    try:
        reset = driver.find_element(By.ID, "resetButton")
        yes = driver.find_element(By.ID, "yes")
    except NoSuchElementException:
        # TODO remove try-except when main has reset modal
        reset = driver.find_element(By.ID, "clearButton")
        yes = editor

    # for each test in the CSV file
    print("Reading CSV test file")
    file = open(csv_name, encoding="utf-8", newline="")
    file.readline()  # skip header
    test_id = 0
    for row in csv.reader(file):
        test_id += 1
        name = row[0]
        code = row[1]
        user_input = row[2]
        expect_out = row[3].rstrip().replace("\r", "")
        expect_err = row[4].rstrip().replace("\r", "")

        print(f"Test {test_id}: {name}...", end="", flush=True)
        if expect_out.startswith("TODO"):
            print(todo_msg)
            continue

        # reset Praxly, paste code, and run
        time.sleep(PAUSE)
        reset.click()
        yes.click()
        driver.execute_script(f'ace.edit("aceCode").setValue(`{code}`);')
        editor.click()
        play.click()

        # simulate each line of user input
        for line in user_input.splitlines():
            try:
                prompt = driver.find_element(By.CLASS_NAME, "prompt")
                prompt.send_keys(line)
                prompt.send_keys(Keys.ENTER)
            except NoSuchElementException:
                break  # program crashed

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

    # optional command-line arguments
    if len(sys.argv) == 1:
        main("canvas.csv", "embed.html")
    elif len(sys.argv) == 2:
        main(sys.argv[1], "embed.html")
    elif len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python run_csv.py <csv_name> <html_name>")
        print("   Ex: python run_csv.py canvas.csv embed.html")

    # remove the log file if blank
    if os.path.exists("geckodriver.log"):
        if os.path.getsize("geckodriver.log") == 0:
            os.remove("geckodriver.log")
