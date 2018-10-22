package models.gsv

import models.utils.MyPostgresDriver.api._
import play.api.Play.current

import slick.lifted.ForeignKeyQuery

case class GSVProjection(gsvPanoramaId: String, projectionType: String, panoYawDeg: Double, tiltYawDeg: Double, tiltPitchDeg: Double)

class GSVProjectionTable(tag: Tag) extends Table[GSVProjection](tag, Some("sidewalk"), "gsv_projection") {
  def gsvPanoramaId = column[String]("gsv_panorama_id", O.PrimaryKey)
  def projectionType = column[String]("projection_type")
  def panoYawDeg = column[Double]("pano_yaw_deg")
  def tiltYawDeg = column[Double]("tilt_yaw_deg")
  def tiltPitchDeg = column[Double]("tilt_pitch_deg")

  def * = (gsvPanoramaId, projectionType, panoYawDeg, tiltYawDeg, tiltPitchDeg) <> ((GSVProjection.apply _).tupled, GSVProjection.unapply)
}

object GSVProjectionTable {
  val db = play.api.db.slick.DB
  val gsvProjections = TableQuery[GSVProjectionTable]
}