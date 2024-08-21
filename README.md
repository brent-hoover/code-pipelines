# Code pipelines

A quick proof-of-concept and toybox for fleshing out the idea of "pipelines" that 
can be dynamically assigned. The pipeline-config.yaml file is a stand-in for
something that could easily be in a db somewhere. 

It has one endpoint "validateEmail" that takes an email address and a cost. Then it will
run all the function defined in the yaml file that are less than the cost defined in the api
call. (note that this is all mocked checks and API calls to "cat-facts", this will not really validate an email)

