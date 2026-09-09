from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = [line.strip() for line in f.read().splitlines() if line.strip() and not line.startswith("#")]

setup(
    name="digital_jamath",
    version="3.0.0",
    description="Community Trust & Baitul Maal Platform for Indian Masjids, Jamaths & NGOs",
    author="Digital Jamath",
    author_email="info@digitaljamath.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)
