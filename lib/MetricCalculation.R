library(pavo)
library(rjson)

filePath <- commandArgs(trailingOnly=TRUE)[1]

spectra <- getspec(where = filePath, ext = 'Master.Transmission')

objective_metrics <- summary(spectra)

cat(toJSON(objective_metrics))
