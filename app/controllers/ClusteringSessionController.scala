package controllers

import javax.inject.Inject

import com.mohiva.play.silhouette.api.{Environment, Silhouette}
import com.mohiva.play.silhouette.impl.authenticators.SessionAuthenticator
import controllers.headers.ProvidesHeader
import models.clustering_session.{ClusteringSessionTable}
import models.user.User
import play.api.libs.json.{JsObject, Json}

import scala.concurrent.Future

import scala.sys.process._

class ClusteringSessionController @Inject()(implicit val env: Environment[User, SessionAuthenticator])
  extends Silhouette[User, SessionAuthenticator] with ProvidesHeader {

  // Helper methods
  def isAdmin(user: Option[User]): Boolean = user match {
    case Some(user) =>
      if (user.roles.getOrElse(Seq()).contains("Administrator")) true else false
    case _ => false
  }

  // Pages
  def index = UserAwareAction.async { implicit request =>
    if (isAdmin(request.identity)) {
      val clusteringOutput = "python label_clustering.py".!!
      println(clusteringOutput)
      Future.successful(Ok(views.html.clustering("Project Sidewalk", request.identity)))
    } else {
      Future.successful(Redirect("/"))
    }
  }

  def runClustering(routeId: Int) = UserAwareAction.async { implicit request =>
    if (isAdmin(request.identity)) {
      val clusteringOutput = "python label_clustering.py".!!
      val testJson = Json.obj("what did we run?" -> "clustering!", "output" -> clusteringOutput)
      Future.successful(Ok(testJson))
    } else {
    Future.successful(Redirect("/"))
    }
  }

  /**
    * Returns all records in clustering_session table that are not marked as deleted.
    */
  def getClusteringSessionsWithoutDeleted = UserAwareAction.async { implicit request =>
    val clusteringSessions= ClusteringSessionTable.selectSessionsWithoutDeleted

    val ses: List[JsObject] = clusteringSessions.map { clusteringSession =>
      val clusteringSessionId: Int = clusteringSession.clusteringSessionId
      val routeId: Int = clusteringSession.routeId
      val clustering_threshold: Double = clusteringSession.clustering_threshold
      val time_created: java.sql.Timestamp = clusteringSession.time_created
      val deleted: Boolean = clusteringSession.deleted
      Json.obj("clusteringSessionId" -> clusteringSessionId, "routeId" -> routeId,
               "clustering_threshold" -> clustering_threshold, "time_created" -> time_created, "deleted" -> deleted)
    }
    val sessionCollection = Json.obj("sessions" -> ses)
    Future.successful(Ok(sessionCollection))
  }

}